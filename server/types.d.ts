declare module 'express-mysql-session' {
  import session from 'express-session';
  import { Pool } from 'mysql2/promise';
  
  export default function(session: any): any;
}