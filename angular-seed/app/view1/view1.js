'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope) {

  $scope.invalidCsv = false;

  //Start : reading csv file and parsing it
  $scope.readCsv = function(){
    $scope.invalidCsv = false;
    if(_.isUndefined($scope.fileContent)){
      $scope.invalidCsv = true;
      return ;
    }
    var serieses = $scope.fileContent.split("\n");
    if(_.isUndefined(serieses)){
      $scope.invalidCsv = true;
      return ;
    }
    var graphSeries = [];
    _.each(serieses, function(series, index){
      //This would give contents after first ',', which is series contents
      var seriesContents = series.substr(series.indexOf(',')+1).split(',');
      var seriesObject = {
        //This would give contents before first ',', which is series name
        name: series.substr(0,series.indexOf(','))
      };
      if(_.isUndefined(seriesContents) || _.isUndefined(series.substr(0,series.indexOf(',')))){
        $scope.invalidCsv = true;
       }
      seriesObject.data = [];
      var tobeSortedArray = [];
      _.each(seriesContents, function(pair){
        var year = parseInt(pair.split('|')[0]);
        var value = parseInt(pair.split('|')[1]);
        if(isNaN(year) || isNaN(value)){
          $scope.invalidCsv = true;
         }
        var tobeSorted = {
          "year": year,
          "value": value
        };
        tobeSortedArray.push(tobeSorted);
      });      
      tobeSortedArray = _.sortBy(tobeSortedArray, ['year']);

      _.each(tobeSortedArray, function(item){
        var pairObject = [item.year, item.value];
        seriesObject.data.push(pairObject);
      });
      graphSeries.push(seriesObject);

    });
    if($scope.invalidCsv){
      return ;
    }
    drawChart(graphSeries);
  };//End: readCsv

  //Start : Draw chat function
  function drawChart(data){

    Highcharts.chart('container', {
    chart: {
        type: 'spline'
    },
    title: {
        text: 'Fission Labs assignment'
    },
    subtitle: {
        text: 'User CSV to JSON data in Highcharts JS'
    },
    xAxis: {
        type: 'date',
        dateTimeLabelFormats: {
            year: '%b'
        },
        title: {
            text: 'Year'
        }
    },
    yAxis: {
        title: {
            text: 'Score'
        }
    },
    tooltip: {
        headerFormat: '<b>{series.name}</b><br>',
        pointFormat: '{point.y:.2f}'
    },

    plotOptions: {
        spline: {
            marker: {
                enabled: true
            }
        }
    },
    series: data
    });
  }
  //End : drawChart
})

.directive('fileReader', function() {
  return {
    scope: {
      fileReader:"="
    },
    link: function(scope, element) {
      angular.element(element).on('change', function(changeEvent) {
        var files = changeEvent.target.files;
        if (files.length) {
          var r = new FileReader();
          r.onload = function(e) {
              var contents = e.target.result;
              scope.$apply(function () {
                scope.fileReader = contents;
              });
          };          
          r.readAsText(files[0]);
        }
      });
    }
  };
});