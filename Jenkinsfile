@Library(['mm-dsl'])_
mm_docker_build_common
{
    REGISTRY_NAME           = "gto-projects-dev-993026/gto-artifacts"
    IMAGE_NAME              = "gto-dbmrs-vtc-frontend-uat"
    CLOUD                   = "gcp"
    AGENT                   = ""
    APP_NAME                = "gto-dbmrs-vtc-frontend-uat"
    CREDENTIALNAME          = "gto-projects-dev"   // specific to my project
    PROJECTNAME             = "gto-projects-dev-993026"
}
mm_k8s_deployment_pipeline_gcp_common
{
    PROJECT                 = "gto-projects-dev-993026"
    REGION                  = "asia-south1-a"
    CLUSTER_NAME            = "gto-nodepool1-gke-k8s"
    ENVIRONMENT             = "dev"
    DEPLOYMENT_NAME         = "gto-dbmrs-vtc-frontend-uat"
    DEPLOYMENT_TYPE         = "automatic"
    RESTRICT_TO_BRANCH      = "jenkins_frontend_uat"
    AGENT                   = "jenkins-gcp-dev-agent"
    CREDENTIALNAME          = "gto-projects-dev"    // specific to my project
    PROJECTNAME             = "gto-projects-dev-993026"               
    PROJECTNAME             = "gto-projects-dev-993026"               
}
