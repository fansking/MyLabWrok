let myApp = angular.module("myApp",[]);
myApp.controller("myController",function ($scope, $http) {
    //获取数据
    /*定义包含所有方法的所有属性的对象数组，包括
     *  path：方法的路径
     *  method：表单提交数据方式
     *  params:不同提交方式的变量属性数组
     *  summary:方法作用简介
     *  description:方法作用解释
     *  response:方法响应页面内容
     *  fun:方法实现的具体函数
     *
     * */

    $scope.operatios=[];
    //以对象形式定义输入变量
    $scope.inputValue={
        "path":{},
        "query":{},
        "body":{}
    };
    $scope.operationFlag=true;
    $scope.flag=false;
    //获取此服务的swagger的json文件并对其解析，得到更友好的对象形式
    $scope.GetOperations=function(URL,service){
        $scope.nowService=service;
        $http.get(URL).then(function (response) {
            $scope.MySwagger = response.data;
            $scope.operationFlag=false;
            $scope.BasePath = $scope.MySwagger.basePath;
            for (let i in $scope.MySwagger.paths) {
                let operation={};
                for (let j in $scope.MySwagger.paths[i]) {
                    operation.path=i;
                    operation.method=j;
                    operation.params={
                        "path":[],
                        "query":[],
                        "body":[]
                    };
                    angular.forEach($scope.MySwagger.paths[i][j].parameters, function (each) {
                        if(each.in==="path"){operation.params.path.push(each);}
                        if(each.in==="query"){operation.params.query.push(each);}
                        if(each.in==="body"){operation.params.body.push(each);}
                    });

                    operation.summary=$scope.MySwagger.paths[i][j].summary;
                    operation.description=$scope.MySwagger.paths[i][j].description;
                    operation.response=$scope.MySwagger.paths[i][j].response;
                    $scope.operatios.push(operation);
                }
            }
            $scope.replacePathVariables=function(path,inputValue){
                for(let k in inputValue.path)
                {
                    path=path.replace("{"+k+"}",inputValue.path[k]);

                }
                return path;
            };
            $scope.Init=function () {
                $scope.inputValue={
                    "path":{},
                    "query":{},
                    "body":{}
                };
            }
            for(let k =0;k<$scope.operatios.length;k++)
            {
                $scope.operatios[k].Fun=(function () {
                    let newUrl=$scope.replacePathVariables($scope.operatios[k].path, $scope.inputValue);
                    $http({
                        url: newUrl,
                        method: $scope.operatios[k].method,
                        params: $scope.inputValue.query,
                        data: $scope.inputValue.body,
                        contentType:"application/json"
                    }).then(
                        function success(response) {
                            $scope.Data = response.data;
                            $scope.message = "发送成功";
                            console.log("$scope.Data");

                        }, function error(response) {
                            $scope.message = "发送失败";//响应错误的处理方法体
                        });
                })
            }
            $scope.nowOperation=$scope.operatios[0];
        })
    };
    //获取APIJson的URL
    $scope.GetUrl=function () {
        $http.get("/metadata").then(function (response){
            $scope.services=response.data;
            for(let s in $scope.services){
                $http({
                    url: '../metadata/'+$scope.services[s].name,
                    method: 'GET',
                }).then(
                    function success() {
                       $scope.services[s].flag=false;
                        $scope.services[s].style="enSelected";
                    }, function error() {
                      $scope.services[s].flag=true;
                        $scope.services[s].style="unSelected";
                    });
            }
        })
    }

    $scope.GetUrl();
})