export CDK_NEW_BOOTSTRAP=1 
# npx cdk bootstrap aws://847104828221/us-east-1 \
#     --cloudformation-execution-policies "arn:aws:iam::847104828221:policy/aabg-viper-cdk-pipeline-deploy-policy" \
#     --qualifier "final"

npx cdk bootstrap aws://272338086991/us-east-1 --profile "damodaw+1+admin" \
    --cloudformation-execution-policies "arn:aws:iam::272338086991:policy/aabg-viper-cdk-pipeline-deploy-policy" \
    --qualifier "blogdemo"
    
# npx cdk bootstrap aws://272338086991/us-west-1 --profile "damodaw+1+admin" \
#     --cloudformation-execution-policies "arn:aws:iam::272338086991:policy/aabg-viper-cdk-pipeline-deploy-policy" \
#     --trust 847104828221 \
#     --qualifier "final"