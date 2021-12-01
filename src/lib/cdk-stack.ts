import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as api from '@aws-cdk/aws-apigateway'

export class KurtsSmarthomeStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // This is the S3 "bucket" to hold your "objects"
        // Buckets are just what you know as folders/directories, and objects are files
        const bucket = new s3.Bucket(this, 'Smart Home Storage Bucket', {
            bucketName: 'kurts-smarthome-storage-bucket', // This must be a globally unique value across all of AWS
        });

        // This role will be used by the API to access the S3 bucket
        const apiRole = new iam.Role(this, "Smart Home Storage API Role", {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            path: "/service-role/"
        });

        // We are making sure the role has read/write access to the bucket
        bucket.grantReadWrite(apiRole);

        // Start of the API definition, we'll need many more lines to fully configure it to do what we want
        const restApi = new api.RestApi(this, 'Smart Home Storage API', {
            restApiName: 'Smart Home Storage API',
            endpointExportName: 'kurts-smarthome-storage-api',
        });

        // Generate an API key for the API (think of it as a password needed to call the API)
        // Note: To actually figure out what the key is, you must log in to the AWS console and find it,
        // there is no way (yet) to have CDK output it as part of the deployment
        const apiKey = restApi.addApiKey('Secret API Key', {
            apiKeyName: 'Secret API Key'
        });

        // A "usage plan" just ties the API key to your API (it can do a lot of other things too, but this is all we need it to do in this case)
        const usagePlan = restApi.addUsagePlan('Usage Plan', {
            name: 'Usage Plan'
        });
        usagePlan.addApiStage({
            stage: restApi.deploymentStage
        });
        usagePlan.addApiKey(apiKey);

        // These API "resources" are set to mimic the bucket/object structure of S3
        const folderResource = restApi.root.addResource("{folder}");
        const itemResource = folderResource.addResource("{item}");

        // This essentially says "if you do a HTTP GET for a specific bucket/object to the API, do the same GET to S3"
        itemResource.addMethod("GET", new api.AwsIntegration({
            service: 's3', // The AWS service to call
            integrationHttpMethod: "GET", // Which HTTP method to use when calling S3
            path: "{bucket}/{object}", // URL path (after base S3 URL) when calling S3
            options: {
                credentialsRole: apiRole,
                requestParameters: {
                    'integration.request.path.bucket': 'method.request.path.folder', // maps folder resource to bucket parameter for S3
                    'integration.request.path.object': 'method.request.path.item' // maps item resource to object parameter for S3
                },
                integrationResponses: [
                    {
                        statusCode: "200"
                    },
                    {
                        statusCode: "400"
                    },
                    {
                        statusCode: "500"
                    }
                ]
            },

        }),
            {
                apiKeyRequired: true, // An API key well be needed to call the API
                requestParameters: { // These are the required parameters to the API
                    'method.request.path.folder': true,
                    'method.request.path.item': true
                },
                methodResponses: [
                    {
                        statusCode: "200"
                    },
                    {
                        statusCode: "400"
                    },
                    {
                        statusCode: "500"
                    }
                ]
            }
        );

        // Do the same for PUT
        itemResource.addMethod("PUT", new api.AwsIntegration({
            service: 's3',
            integrationHttpMethod: "PUT",
            path: "{bucket}/{object}",
            options: {
                credentialsRole: apiRole,
                requestParameters: {
                    'integration.request.path.bucket': 'method.request.path.folder',
                    'integration.request.path.object': 'method.request.path.item'
                },
                integrationResponses: [
                    {
                        statusCode: "200"
                    },
                    {
                        statusCode: "400"
                    },
                    {
                        statusCode: "500"
                    }
                ]
            },

        }),
            {
                apiKeyRequired: true,
                requestParameters: {
                    'method.request.path.folder': true,
                    'method.request.path.item': true
                },
                methodResponses: [
                    {
                        statusCode: "200"
                    },
                    {
                        statusCode: "400"
                    },
                    {
                        statusCode: "500"
                    }
                ]
            }
        );
    }
}