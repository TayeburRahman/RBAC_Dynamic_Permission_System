import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { ReportService } from './report.service';
import httpStatus from 'http-status';

const getStats = catchAsync(async (req: Request, res: Response) => {
    console.log("Fetching report stats...");
    const result = await ReportService.getReportStats();
    console.log("Report stats fetched successfully");
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report statistics fetched successfully',
        data: result
    });
});

export const ReportController = {
    getStats
};
