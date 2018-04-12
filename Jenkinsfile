
properties([
    parameters([
        booleanParam(name: 'WITH_CLIQZ_MASTER', defaultValue: false, description: 'Builds with latest Cliqz master')
    ])
])

node('docker') {
    stage ('Checkout') {
        checkout scm
    }

    def img
    def artifacts = []
    def uploadPath = "cdncliqz/update/ghostery/${env.BRANCH_NAME}"

    stage('Build Docker Image') {
        img = docker.build('ghostery/build', '--build-arg UID=`id -u` --build-arg GID=`id -g` .')
    }

    stage('Build Extension') {
        img.inside() {
            withCache {
                sh 'rm -rf build'
                if (params.WITH_CLIQZ_MASTER) {
                    sh 'npm install --save https://s3.amazonaws.com/cdncliqz/update/edge/ghostery/master/latest.tgz'
                }
                // make browser-core noisy
                sh 'sed -i \'s/global.__DEV__/true/1\' node_modules/browser-core/build/core/console.js'
                withGithubCredentials {
                    sh 'moab makezip'
                }
                // get the name of the firefox build
                artifacts.add(sh(returnStdout: true, script: 'ls build/ | grep firefox').trim())
            }
        }
    }

    stage('Package Chrome') {
        withGithubCredentials {
            def chromeArtifact = sh(returnStdout: true, script: 'ls build/ | grep chrome').trim().replace('.zip', '')
            echo "${chromeArtifact}"
            sh """#!/bin/bash -l
                set -x
                set -e
                rm -rf ${chromeArtifact}/
                mkdir -p ${chromeArtifact}
                unzip build/${chromeArtifact}.zip -d ${chromeArtifact}
                tools/crxmake.sh ${chromeArtifact}/ ~/.ssh/id_rsa
                mv ${chromeArtifact}.crx build/
                """
            artifacts.add("${chromeArtifact}.crx")
        }
    }

    stage('Publish Builds') {
        withCredentials([[
                $class: 'UsernamePasswordMultiBinding',
                credentialsId: '06ec4a34-9d01-46df-9ff8-64c79eda8b14',
                passwordVariable: 'AWS_SECRET_ACCESS_KEY',
                usernameVariable: 'AWS_ACCESS_KEY_ID']]) {
            echo "${env.BRANCH_NAME}/${env.BUILD_NUMBER}"
            def uploadLocation = "s3://${uploadPath}/"
            currentBuild.description = uploadLocation
            artifacts.each {
                sh "aws s3 cp build/${it} ${uploadLocation}  --acl public-read"
            }
        }
    }

    if (env.BRANCH_NAME == 'develop') {
        stage('Sign and Publish') {
            def artifactUrl = "https://s3.amazonaws.com/${uploadPath}/${artifact}"
            build job: 'addon-repack', parameters: [
                string(name: 'XPI_URL', value: artifactUrl),
                string(name: 'XPI_SIGN_CREDENTIALS', value: '41572f9c-06aa-46f0-9c3b-b7f4f78e9caa'),
                string(name: 'XPI_SIGN_REPO_URL', value: 'git@github.com:cliqz/xpi-sign.git')
            ]
        }
    }
}

def withCache(Closure body=null) {
    def cleanCache = {
        sh 'rm -fr node_modules'
    }

    try {
        cleanCache()
        // Main dependencies
        sh 'cp -fr /home/jenkins/node_modules .'

        body()
    } finally {
        cleanCache()
    }
}

def withGithubCredentials(Closure body) {
    withCredentials([sshUserPrivateKey(
            credentialsId: '6739a36f-0b19-4f4d-b6e4-b01d0bc2e175',
            keyFileVariable: 'GHOSTERY_CI_SSH_KEY')
            ]) {
        // initialise git+ssh access using ghostery-ci credentials
        try {
            sh '''#!/bin/bash -l
                set -x
                set -e
                mkdir -p ~/.ssh
                cp $GHOSTERY_CI_SSH_KEY ~/.ssh/id_rsa
                chmod 600 ~/.ssh/id_rsa
                ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
            '''
            body()
        } finally {
            sh 'rm -f ~/.ssh/id_rsa'
            sh 'rm -f ~/.ssh/known_hosts'
        }
    }
}