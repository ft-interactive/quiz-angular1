import ngAnimate from 'angular-animate';
import ngRoute from 'angular-route';
import ngSanitize from 'angular-sanitize';
import $ from 'jquery';

// App module
const app = angular.module('quizApp', [
  'ngAnimate',
  'ngRoute',
  'ngSanitize',
  'angular-animation-counter',
  '720kb.socialshare'
]);

// Routes
app.config(['$locationProvider',
  function ($locationProvider) {
    // Use the HTML5 history API
    $locationProvider.html5Mode(true);
  }
]);

// Controllers
app.controller('QuizCtrl', ['$scope', '$http',
  function ($scope) {
    $scope.questions = [];
    $scope.choices = [];
    $scope.questionsAnswered = { value: 0 };
    $scope.userScore = { value: 0 };
    $scope.quizStatus = { isOver: false };
    $scope.remainPercentage = { value: 0 };
    $scope.leavePercentage = { value: 0 };
    $scope.result = { text: '' };
    $scope.message = { content: '' };

    angular.forEach(window.quiz.data, row => {
      $scope.questions.push(row);
      $scope.choices.push([row.choice1, row.choice2, row.choice3]);
    });
  }
]);

app.controller('QuestionCtrl', ['$scope', '$timeout', '$window',
  function ($scope, $timeout, $window) {
    $scope.submitAnswer = function () {
      $scope.answerSubmitted = true;
      $scope.questionsAnswered.value++;
      $scope.userAnswer = this.choice;
      $scope.remainAnswer = $scope.questions[$scope.questionsAnswered.value - 1].remainanswer;
      $scope.leaveAnswer = $scope.questions[$scope.questionsAnswered.value - 1].leaveanswer;

      // Check to see if userAnswer matches remainAnswer or leaveAnswer
      if ($scope.userAnswer === $scope.remainAnswer) {
        $scope.isRemain = true;
        $scope.userScore.value++;
      } else {
        if ($scope.userAnswer === $scope.leaveAnswer) {
          $scope.isLeave = true;
          $scope.userScore.value--;
        }
      }

      // Display result splash
      if ($scope.answerSubmitted) {
        $scope.showSplash = true;
        $timeout(() => {
          $scope.showSplash = false;
        }, 250);
      }

      function calculatePercentage() {
        // Calculate user score as a percentage
        $scope.remainPercentage.value = Math.round($scope.userScore.value /
          $scope.questions.length * 100);

        // If userPercentage < 0, make it into leavePercentage
        if ($scope.remainPercentage.value <= 0) {
          if ($scope.remainPercentage.value < 0) {
            $scope.leavePercentage.value = -$scope.remainPercentage.value;
          } else {
            console.log('User is ambivalent');
          }
        }

        console.log('remainPercentage: ' + $scope.remainPercentage.value,
        'leavePercentage: ' + $scope.leavePercentage.value);
      }

      function message() {
        if ($scope.remainPercentage.value <= 0) {
          if ($scope.remainPercentage.value < 0) {
            $scope.message.content = 'If you aren\'t already, you may want to' +
              ' consider voting <strong>leave</strong>.';
          } else {
            $scope.message.content = 'Still undecided? Go to our ' +
            "<a href='http://www.ft.com/eu-referendum'>EU referendum home page</a> for all the FT's referendum coverage.";
          }
        } else {
          $scope.message.content = 'If you aren\'t already, you may want to' +
            ' consider voting <strong>remain</strong>.';
        }
      }

      // Check to see if quiz is over
      if ($scope.questionsAnswered.value === $scope.questions.length) {
        $scope.quizStatus.isOver = true;

        calculatePercentage();
        message();

        if ($scope.remainPercentage.value <= 0) {
          if ($scope.remainPercentage.value < 0) {
            $scope.result.text = 'leave';
          } else {
            $scope.result.text = 'Completely neutral';
          }
        } else {
          $scope.result.text = 'remain';
        }
      }

      console.log('questionsAnswered: ' + $scope.questionsAnswered.value);

      // Update progress bar
      const progress = ($scope.questionsAnswered.value / $scope.questions.length) * 100;
      $('.progress-bar').width(progress + '%');
    };
  }
]);
