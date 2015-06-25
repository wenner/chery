// This is the controller for the root splash page
// Sign up, sign in.

angular.module('chery')
  .controller('WelcomeCtrl', function($state) {
    this.gotoLogin = function(){
      $state.go('auth.login');
    };

    this.gotoRegister = function(){
      $state.go('auth.register');
    };
  });
