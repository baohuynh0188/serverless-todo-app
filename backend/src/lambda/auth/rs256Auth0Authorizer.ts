import 'source-map-support/register';
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { verify } from 'jsonwebtoken';
import JwtPayload from '../../auth/JwtPayload';

const cert = `-----BEGIN CERTIFICATE-----
MIIDHDCCAgSgAwIBAgIIFRrOI5x/LbMwDQYJKoZIhvcNAQELBQAwLDEqMCgGA1UE
AxMhZGV2LTN6eGlnZWtuMHBkNmJqNm0udXMuYXV0aDAuY29tMB4XDTIzMDQyNzA3
MDg1M1oXDTM3MDEwMzA3MDg1M1owLDEqMCgGA1UEAxMhZGV2LTN6eGlnZWtuMHBk
NmJqNm0udXMuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
AQEAnYSguG/3CQ58QustTRKI8ELgKpsPokVDrdztcB7U6ZmPAkcx/zJl8vqPMsC7
3xOnN0K+/3lZNUY1X3ugrdnTvEhf+yLNztHmvvFszWiSL/nbryZ2dU7k0LF8WgQ2
l9917IxMG6/g3OQrTfYK8sqNE1rXq35krQKamWL4SJsGz1Ua8zlwp1ZG2vFq8FBL
k5dkD/B92vN2L7GSpvp6Jag7kVG87RoZwbCJM3R6UprGMDEx0UhbmBft9l6aVAvM
zQ4lB7bggVFJe7O60S3euBitQg1bAklrTqaqPX82JsWEZe0ovsGVoUqj11GLTiEN
rhqZ3kcYnoV/UJFbLrZMZYFxAQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0G
A1UdDgQWBBRr7EIcE/W6C8F5OZayrDH2JbiHTTAOBgNVHQ8BAf8EBAMCAoQwDQYJ
KoZIhvcNAQELBQADggEBAGuvttrxMTFzHE2Hq+GKvk3gV/9P6o4HNeIDccMjwQmp
48c1ghwl7iKTbuwD8ssJd1g5cOrADIOpU6Dtf/m91paudEEYQGHdzzH8kWsBBBLp
jrJ373YEKLrpATLk9gmzaoXdvVCUr47PgbLJx2Oa+yupLQV9MiHvfwnOWMSyQQ+z
FYf/8moymWp+a57mlckn93hqzI/y7qKaCEaWLImcYw3AktTVaPwY1Ie4O4DSXll4
EeVovUgb41/VRrjfSeWBOlVl8wlJM8MtII5HJQGAZztTAqe5NnbtjjmQs7wDMzpA
yU+hoYZWE8ZSSxDwup+glvArVfdtdmITOdWQy7M/7fE=
-----END CERTIFICATE-----`;

export const handler = async (
    event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
    try {
        const jwtToken = verifyToken(event.authorizationToken);
        console.log('User was authorized', jwtToken);

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
    } catch (e) {
        console.log('User authorized', e.message);

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
};

const verifyToken = (authHeader: string): JwtPayload => {
    if (!authHeader) throw new Error('No authentication header');

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');

    const split = authHeader.split(' ');
    const token = split[1];

    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
};
