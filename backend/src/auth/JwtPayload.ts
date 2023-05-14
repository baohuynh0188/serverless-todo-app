/**
 * A payload of a JWT token
 */
export default interface JwtPayload {
    iss: string;
    sub: string;
    iat: number;
    exp: number;
}
