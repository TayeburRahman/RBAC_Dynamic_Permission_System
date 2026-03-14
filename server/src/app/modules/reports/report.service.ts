import Auth from '../auth/auth.model';
import Lead from '../leads/lead.model';
import Task from '../tasks/task.model';
import { Ticket } from '../tickets/ticket.model';
import { Order } from '../orders/order.model';
import { ENUM_USER_ROLE } from '../../../enums/user';

const getReportStats = async () => {
    try {
        const now = new Date();
        const lastMonth = new Date(new Date().setMonth(now.getMonth() - 1));

        // 1. Basic Stats & Growth
        const [
            totalUsers, 
            prevTotalUsers,
            totalLeads, 
            totalTasks, 
            activeOrders, 
            openTickets,
            totalRevenueRecord,
            prevRevenueRecord
        ] = await Promise.all([
            Auth.countDocuments(),
            Auth.countDocuments({ createdAt: { $lt: lastMonth } }),
            Lead.countDocuments(),
            Task.countDocuments(),
            Order.countDocuments({ status: { $ne: 'delivered' } }),
            Ticket.countDocuments({ status: 'open' }),
            Order.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
            Order.aggregate([{ $match: { createdAt: { $lt: lastMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
        ]);

        const calculateGrowth = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const userGrowthPercent = calculateGrowth(totalUsers, prevTotalUsers);
        const revenue = totalRevenueRecord[0]?.total || 0;
        const prevRevenue = prevRevenueRecord[0]?.total || 0;
        const revenueGrowthPercent = calculateGrowth(revenue, prevRevenue);

        // 2. User Growth (Last 6 Months)
        const userGrowth = await Auth.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().setMonth(now.getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    users: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 3. Lead Distribution by Status
        const leadDistribution = await Lead.aggregate([
            {
                $group: {
                    _id: "$status",
                    value: { $sum: 1 }
                }
            }
        ]);

        // 4. Task Velocity (Last 7 Days)
        const taskVelocity = await Task.aggregate([
            {
                $match: {
                    status: 'done',
                    updatedAt: { $gte: new Date(new Date().setDate(now.getDate() - 7)) }
                }
            },
            {
                $group: {
                    _id: { 
                        day: { $dayOfMonth: "$updatedAt" }, 
                        month: { $month: "$updatedAt" },
                        dayOfWeek: { $dayOfWeek: "$updatedAt" }
                    },
                    completed: { $sum: 1 }
                }
            },
            { $sort: { "_id.month": 1, "_id.day": 1 } }
        ]);

        // Format Data for Frontend with Padding for missing days
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const formattedUserGrowth = userGrowth.map(item => ({
            name: monthNames[item._id.month - 1],
            users: item.users
        }));

        const formattedLeadDistribution = leadDistribution.map(item => ({
            name: (item._id || 'unassigned').charAt(0).toUpperCase() + (item._id || 'unassigned').slice(1),
            value: item.value
        }));

        // Pad task velocity for last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayName = dayNames[d.getDay()];
            const match = taskVelocity.find(v => v._id.day === d.getDate() && v._id.month === (d.getMonth() + 1));
            last7Days.push({
                day: dayName,
                completed: match ? match.completed : 0
            });
        }

        return {
            summary: {
                totalUsers,
                userGrowthPercent,
                totalLeads,
                totalTasks,
                activeOrders,
                openTickets,
                totalRevenue: revenue,
                revenueGrowthPercent
            },
            charts: {
                userGrowth: formattedUserGrowth,
                leadDistribution: formattedLeadDistribution,
                taskVelocity: last7Days
            }
        };
    } catch (error) {
        console.error("ReportService Error:", error);
        throw error;
    }
};

export const ReportService = {
    getReportStats
};
