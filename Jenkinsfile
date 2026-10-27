// CI/CD pipeline for Saksham.
// Git push -> Jenkins -> test -> build Docker images -> push to Docker Hub
//          -> deploy to Kubernetes (rolling update) -> smoke test.
//
// EDIT ONLY ONE LINE: DOCKERHUB_USER below (your Docker Hub username).

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  // The VM has no public address, so GitHub cannot call Jenkins (webhook).
  // Instead Jenkins asks GitHub for new commits every minute.
  triggers { pollSCM('* * * * *') }

  environment {
    DOCKERHUB_USER = 'vaish1409'
    BACKEND_IMAGE  = "${DOCKERHUB_USER}/saksham-backend"
    FRONTEND_IMAGE = "${DOCKERHUB_USER}/saksham-frontend"
    TAG            = "${env.BUILD_NUMBER}"
    NAMESPACE      = 'saksham'
    KUBECONFIG     = '/var/lib/jenkins/.kube/config'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        sh 'git log -1 --oneline'
      }
    }

    stage('Test backend') {
      steps {
        // Runs the unit tests inside a throw-away Node container,
        // so Node does not need to be installed on the VM.
        sh '''
          docker run --rm \
            --user "$(id -u):$(id -g)" \
            -e HOME=/tmp -e npm_config_cache=/tmp/.npm \
            -v "$PWD/backend":/app -w /app \
            node:20-alpine sh -c "npm ci && npm test"
        '''
      }
    }

    stage('Build Docker images') {
      steps {
        sh '''
          docker build -t "$BACKEND_IMAGE:$TAG"  -t "$BACKEND_IMAGE:latest"  backend
          docker build -t "$FRONTEND_IMAGE:$TAG" -t "$FRONTEND_IMAGE:latest" frontend
        '''
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                          usernameVariable: 'DH_USER',
                                          passwordVariable: 'DH_PASS')]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker push "$BACKEND_IMAGE:$TAG"
            docker push "$BACKEND_IMAGE:latest"
            docker push "$FRONTEND_IMAGE:$TAG"
            docker push "$FRONTEND_IMAGE:latest"
            docker logout
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          try {
            sh '''
              kubectl apply -f k8s/00-namespace.yaml
              kubectl -n "$NAMESPACE" get secret saksham-secret >/dev/null || {
                echo "Secret saksham-secret is missing. Create it first (see docs/DEVOPS_GUIDE.md, Step 6)."
                exit 1
              }

              # Fill in the image names, then apply every manifest.
              rm -rf rendered && mkdir rendered
              for f in k8s/0*.yaml; do
                sed -e "s|__BACKEND_IMAGE__|$BACKEND_IMAGE:$TAG|g" \
                    -e "s|__FRONTEND_IMAGE__|$FRONTEND_IMAGE:$TAG|g" \
                    "$f" > "rendered/$(basename "$f")"
              done
              kubectl apply -f rendered/

              kubectl -n "$NAMESPACE" rollout status deployment/postgres --timeout=180s
              kubectl -n "$NAMESPACE" rollout status deployment/backend  --timeout=240s
              kubectl -n "$NAMESPACE" rollout status deployment/frontend --timeout=180s
            '''
          } catch (err) {
            // If the new version does not become healthy, go back to the previous one.
            sh '''
              kubectl -n "$NAMESPACE" rollout undo deployment/backend  || true
              kubectl -n "$NAMESPACE" rollout undo deployment/frontend || true
            '''
            error("Deployment failed and was rolled back: ${err}")
          }
        }
      }
    }

    stage('Smoke test') {
      steps {
        // Calls the real API through nginx, the same path a browser uses.
        sh '''
          for i in $(seq 1 15); do
            if curl -fsS http://localhost:30080/api/schemes >/dev/null; then
              echo "App is serving traffic."; exit 0
            fi
            echo "waiting for app ($i/15)..."; sleep 4
          done
          echo "Smoke test failed"; exit 1
        '''
      }
    }
  }

  post {
    success { echo "Deployed ${env.BACKEND_IMAGE}:${env.TAG} and ${env.FRONTEND_IMAGE}:${env.TAG}" }
    failure { echo 'Pipeline failed. Open the red stage above and read its log.' }
    always  { sh 'docker image prune -f || true' }
  }
}
