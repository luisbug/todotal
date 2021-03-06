angular.module('app').controller('tasksCtrl', ['$scope', 'task', 'user',
  function ($scope, task, user) {
  'use strict';

  $scope.tasks = [];
  $scope.editing = {};

  $scope.create = function (t) {
    if (!t.trim()) {
      return;
    }

    var lastTask = $scope.tasks.length ? $scope.tasks[$scope.tasks.length-1] : null,
      _task = {
        task: t,
        weight: lastTask ? lastTask.weight -1 : 0,
        done: 0
      };

    $scope.tasks.push(_task);
    $scope.taskNew = '';
    task.create(_task).then(function (res) {
      _task.id = res.data.id;
    });
  };

  $scope.update = function (t) {
    $scope.editing.task = undefined;
    if (t.task.trim()) {
      task.update(t).then(undefined, function (res) {
        if (res.status == 404) {
          var ix = $scope.tasks.indexOf(t);
          $scope.tasks.splice(ix, 1);
        }
      });
    }
  };

  $scope.done = function (t) {
    return !!t.done;
  };

  $scope.toggleDone = function (t) {
    t.done = !t.done ? 1 : 0;
    $scope.update(t);
  };

  $scope.remove = function (t) {
    var ix = $scope.tasks.indexOf(t);
    task.delete(t).then(function () {
      $scope.tasks.splice(ix, 1);
    }, function () {
      $scope.tasks.splice(ix, 1);
    });
  };

  $scope.logout = user.logout;

  function loadTasks () {
    task.list().then(function (res) {
      $scope.tasks.length = 0;
      res.data.forEach(function (task) {
        $scope.tasks.push(task);
      });
    });
  }

  $scope.$watch('tasks', function (tasks) {
    var _weight = Infinity,
      ordered = true;
    tasks.forEach(function (t, ix) {
      if (t.weight >= _weight) {
        ordered = false;
        return false;
      }
      _weight = t.weight;
    });

    if (!ordered) {
      var total = tasks.length;
      tasks.forEach(function (_t, ix) {
        var oldW = _t.weight;
        _t.weight = total - ix;
        if (oldW != _t.weight) {
          task.update(_t);
        }
      });
    }

  }, true);

  $scope.$watch('loggedIn', function (loggedIn) {
    if (loggedIn) {
      loadTasks();
    }
  });

}]);