node('docker') {
    stage ('Checkout') {
        checkout scm
    }

    def img

    stage('Build Docker Image') {
        img = docker.build('ghostery/build', '--build-arg UID=`id -u` --build-arg GID=`id -g` .')
    }

    stage('Build Extension') {
      img.inside() {
        withCache {
          // rerun postinstall for vendor-copy
          sh 'npm run postinstall'
          sh 'npm run build.prod'
          sh 'web-ext build --overwrite-dest'
        }
      }
    }

    stage('Publish') {
      withCredentials([[
          $class: 'UsernamePasswordMultiBinding',
          credentialsId: '06ec4a34-9d01-46df-9ff8-64c79eda8b14',
          passwordVariable: 'AWS_SECRET_ACCESS_KEY',
          usernameVariable: 'AWS_ACCESS_KEY_ID']]) {
        sh 'aws s3 sync web-ext-artifacts/ s3://cdncliqz/update/ghostery/nightly_test/ --acl public-read'
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
