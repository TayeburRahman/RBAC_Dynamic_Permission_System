/* eslint-disable no-unused-vars */
export enum ENUM_USER_ROLE {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN', 
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
}

export enum ENUM_SOCKET_EVENT {
  CONNECT = "connection",
  NOTIFICATION = "notification",  
  MESSAGE_GETALL = "message",
  CONVERSION = "conversion",
}