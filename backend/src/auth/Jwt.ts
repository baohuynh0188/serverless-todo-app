import JwtPayload from './JwtPayload';
import { JwtHeader } from 'jsonwebtoken';

/**
 * Interface representing a JWT token
 */
export default interface Jwt {
    header: JwtHeader;
    payload: JwtPayload;
}
