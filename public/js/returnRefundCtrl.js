angular.module('SasaApp').controller('returnRefundCtrl', ($scope) => {
  $scope.endDate = new Date();
  $scope.startDate = new Date($scope.endDate.getTime() - 86400000 * 30);
});
