angular.module('store-directives-datasets')
.directive("formatsResult", function($filter, $routeParams, LocationSearchService, DatasetListService) {
    return {
        restrict: "E",
        templateUrl: "directives/datasets/formats-results.html",
        scope: {},
        controller: function($scope, rest) {
            var filterName = 'files.type';
            $scope.limitFormats = 0;
            $scope.filetypes = [];
            $scope.resultFormats = [];
            $scope.lessThanLimit;
            $scope.fileTypesCount = {};
            $scope.loadFormats = function(limit) {
                $scope.limitFormats += limit;
                $scope.resultFormats = rest().get({
                    type: "filetypes",
                    params: "orderBy=name&sort=ASC&limit=5&skip=" + $scope.limitFormats
                }, function() {
                    for (var i = 0; i < $scope.resultFormats.data.length; i++) {
                        var filetype = $scope.resultFormats.data[i];
                        filetype.active = LocationSearchService.isActive(filterName, filetype.id);
                        filetype.slug = $filter('slug')(filetype.name);
                        $scope.filetypes.push(filetype);
                        $scope.loadFileTypeCount(filetype.id);
                    }
                    $scope.lessThanLimit = $scope.resultFormats.data.length < limit;
                });
                $scope.datasetCount = {};
            };

            //This won't scale. TODO: Change to /count
            $scope.loadFileTypeCount = function(fileTypeId){
                $scope.fileTypesCount[fileTypeId] = 0;
                $scope.params = {
                    include: ['files', 'tags', 'categories'].join(),
                    'files.type': fileTypeId,
                    'categories.name': $routeParams['categories.name'],// This is the only filter that accepts slug name :(
                };
                DatasetListService.getDatasets($scope.params, function(results) {
                    $scope.fileTypesCount[fileTypeId] = results.length;
                });
            };

            $scope.showLess = function(limit) {
                var countFormats = $scope.filetypes.length;
                var minCount = Math.min(countFormats, limit);
                $scope.filetypes.splice(minCount, countFormats - minCount);
                $scope.limitFormats = 0;
                $scope.lessThanLimit = false;
            };

            $scope.loadFormats(0);
            $scope.selectFiletype = function(filetype) {
                if(filetype.active) {
                    LocationSearchService.removeFilterValue(filterName, filetype.id);
                } else {
                    LocationSearchService.addFilterValue(filterName, filetype.id);
                }
            };
            $scope.removeAll = function() {
                LocationSearchService.deleteFilter(filterName);
            };
        },
        controllerAs: "formats"
    };
});