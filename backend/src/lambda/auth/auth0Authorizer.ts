import 'source-map-support/register';
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import JwtPayload from '../../auth/JwtPayload';
import { secretsManager } from 'middy/middlewares';
import * as middy from 'middy';

const logger = createLogger('auth');

const secretId = process.env.AUTH_0_SECRET_ID;
const secretField = process.env.AUTH_0_SECRET_FIELD;

export const handler = middy(
    async (
        event: CustomAuthorizerEvent,
        context: any
    ): Promise<CustomAuthorizerResult> => {
        logger.info('Authorizing a user', event.authorizationToken);
        try {
            const jwtToken = verifyToken(
                event.authorizationToken,
                context.AUTH0_SECRET[secretField]
            );
            logger.info('User was authorized', jwtToken);

            return {
                principalId: jwtToken.sub,
                policyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: 'execute-api:Invoke',
                            Effect: 'Allow',
                            Resource: '*',
                        },
                    ],
                },
            };
        } catch (error) {
            logger.error('User not authorized', { error: error.message });

            return {
                principalId: 'user',
                policyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: 'execute-api:Invoke',
                            Effect: 'Deny',
                            Resource: '*',
                        },
                    ],
                },
            };
        }
    }
);

const verifyToken = (authHeader: string, secret: string): JwtPayload => {
    const token = getToken(authHeader);

    return verify(token, secret) as JwtPayload;
};

const getToken = (authHeader: string): string => {
    if (!authHeader) throw new Error('No authentication header');

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');

    const split = authHeader.split(' ');
    const token = split[1];

    return token;
};

handler.use(
    secretsManager({
        awsSdkOptions: { region: 'us-east-1' },
        cache: true,
        cacheExpiryInMillis: 60000,
        throwOnFailedCall: true,
        secrets: {
            AUTH0_SECRET: secretId,
        },
    })
);
