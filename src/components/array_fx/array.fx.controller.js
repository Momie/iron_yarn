(function() {
    'use strict';

    angular.module('ironridge')

    .controller('ArrayFxCtrl', function($scope, $rootScope, $timeout, $document, $state, $stateParams, $localStorage, $window, projectFx, panelFx, lodash, alerts, msgHandler) {
        var _holder,
            _holderSvg,
            _canvasWidth = 928,
            _canvasHeight = 464,
            _showAllHolder,
            _showAllHolderGroup,
            _showAllHolderRect,
            _showAllHolderGSmall,
            _panels = [],
            _projectId = $stateParams.id,
            _minZoom = 0.2,
            _maxZoom = 1.1,
            _scale = 1,
            _realSmallScale = 1/25,
            _smallScale = 1/25,
            _smallCanvasWidth = _canvasWidth * 2 / 10,//184,
            _smallCanvasHeight = _canvasHeight * 2 / 10,
            _x1 = 0,
            _y1 = 0,
            _z1 = 1,
            //92.8,
            _transformCanvas = [];


            _transformCanvas[0.2] = {calculStroke : 0, calculStrokeDec : 0, setXYPos : {x : 0, y : 0}, setXYPosSmall : {x : 0, y : 0}};
            _transformCanvas[0.3] = {calculStroke : 0.65, calculStrokeDec : 0.31, setXYPos : {x : (0.7 * _canvasHeight), y : (0.7 * _canvasHeight)/2}, setXYPosSmall : {x : 40, y : 20}};
            _transformCanvas[0.4] = {calculStroke : 0.99, calculStrokeDec : 0.408, setXYPos : {x : (0.6 * _canvasHeight), y : (0.6 * _canvasHeight)/2}, setXYPosSmall : {x : 28, y : 14}};
            _transformCanvas[0.5] = {calculStroke : 1.19, calculStrokeDec : 0.509, setXYPos : {x : (0.5 * _canvasHeight), y : (0.5 * _canvasHeight)/2}, setXYPosSmall : {x : 18, y : 9}};
            _transformCanvas[0.6] = {calculStroke : 1.33, calculStrokeDec : 0.607, setXYPos : {x : (0.4 * _canvasHeight), y : (0.4 * _canvasHeight)/2}, setXYPosSmall : {x : 12, y : 6}};
            _transformCanvas[0.7] = {calculStroke : 1.42, calculStrokeDec : 0.711, setXYPos : {x : (0.3 * _canvasHeight), y : (0.3 * _canvasHeight)/2}, setXYPosSmall : {x : 8, y : 4}};
            _transformCanvas[0.8] = {calculStroke : 1.5, calculStrokeDec : 0.808, setXYPos : {x : (0.2 * _canvasHeight), y : (0.7 * _canvasHeight)/2}, setXYPosSmall : {x : 5, y : 2.5}};
            _transformCanvas[0.9] = {calculStroke : 1.55, calculStrokeDec : 0.912, setXYPos : {x : (0.1 * _canvasHeight), y : (0.7 * _canvasHeight)/2}, setXYPosSmall : {x : 2, y : 1}};
            _transformCanvas[1] = {calculStroke : 1.59, calculStrokeDec : 1.01, setXYPos : {x : 0, y : 0}, setXYPosSmall : {x : 0.5, y : 0.5}};
            _transformCanvas[1.1] = {calculStroke : 1.63, calculStrokeDec : 1.115, setXYPos : {x : (-0.1 * _canvasHeight), y : (-0.1 * _canvasHeight)/2}, setXYPosSmall : {x : -1, y : -1}};
        $rootScope.nbrPanelsPortrait = 0;
        $rootScope.nbrPanelsLandscape = 0;
        $rootScope.selectedPanels = [];
        $rootScope.showDimension = true;
        $scope.orientation = false;
        $scope.pGridRow = 8;
        $scope.pGridCol = 20;
        $scope.lGridRow = 12;
        $scope.lGridCol = 12;
        $scope.expand = false;
        $scope.showMenuArray = false;
        $scope.widthHovered = 0;
        $scope.heightHovered = 0;

        $scope.hover = {
            row: 0,
            col: 0
        };

        $scope.panelInput = {
          'Column':0,
          'Row':0
        };

        $scope.disableArrayBtn = false;
        $scope.disableSaveBtn = false;
        $scope.disableOrientBtn = false;
        $scope.disableDeleteBtn = false;
        $scope.selectorshow = false;
        $scope.selectedPanel = null;
        $scope.exceededCan = false;
        $scope.pannelIndex = 0;
        $scope.isFullScreen = false;
        $scope.panelWidth = angular.element('#holderContainer').width();//_canvasWidth;
        $scope.panelHeight = _canvasHeight;


        var _reseizeFullScreen = function(){
          if(!$scope.isFullScreen){
            //angular.element('body').css('overflow', 'auto');
            $scope.panelWidth = angular.element('#holderContainer').width();//_canvasWidth;
            $scope.panelHeight = _canvasHeight;
          }
          else{
            //angular.element('body').css('overflow', 'hidden');
            $scope.panelWidth = angular.element(window).width();
            $scope.panelHeight = angular.element(window).height() - 70;
          }
        };
        var _zoomAnnim = function(){
          // var tx, ty;
          //
          // tx = (1 - _scale) * _canvasHeight;
          // ty = (1 - _scale) * _canvasHeight/2;
          //
          // myMatrix.translate(tx, ty);
          // myMatrix.scale(_scale);

          _holder.matrix.a = _holder.matrix.d = _scale;

          _holder.animate({
              //transform: myMatrix
              transform: _holder.matrix
          }, 300, mina.easein, function() {
            _showAll();
            _updateSmallScale();
            $rootScope.reposiCanvas();
          });
        };

        var _drawSmallPanel = function(){
          var x, y, width, height;

          if(_showAllHolderGSmall) _showAllHolderGSmall.clear();

          for(var count = 0; count < _panels.length; count++){
            x = ($localStorage.ironridge[projectFx.info.id][_panels[count].data._id].x + _canvasWidth * 2) * _realSmallScale;
            y = ($localStorage.ironridge[projectFx.info.id][_panels[count].data._id].y +  _canvasHeight * 2) * _realSmallScale;
            width = _panels[count].data.columns * _panels[count].getCellWidth() * _realSmallScale;
            height = _panels[count].data.rows * _panels[count].getCellHeight() * _realSmallScale;
            _showAllHolderGSmall.rect(x, y, width, height).attr({fill: '#71A6E3', 'fill-opacity': 1, class: 'small-panel'});
          }
        };

        var _calculSmallCanvas = function(){
          var strokeScale = _transformCanvas[_scale].calculStroke,
          stroke = _smallCanvasWidth * strokeScale;

          return {
            'x': -stroke/4,
            'y': -stroke/4 - stroke/(_smallCanvasHeight/10) - 3 * strokeScale,
            'width': stroke/2 + _smallCanvasWidth,
            'height': stroke*3/4 + _smallCanvasHeight,
            'stroke' : stroke
          };
        };

        var _updateSmallScale = function(){
          var smallCanvasObj = _calculSmallCanvas();

          _smallScale = (smallCanvasObj.stroke / 2) / (_canvasWidth * 5 * _scale - _canvasWidth);
        };

        var _drawMainShowAll = function(){
          var smallCanvasObj = _calculSmallCanvas();

          _showAllHolderRect = _showAllHolderGroup.rect(smallCanvasObj.x, smallCanvasObj.y, smallCanvasObj.width, smallCanvasObj.height)
                                                  .attr({
                                                    'fill': '#fff',
                                                    'fill-opacity': 0,
                                                    'stroke': '#000',
                                                    'strokeWidth': smallCanvasObj.stroke,
                                                    'strokeOpacity': 0.1,
                                                    'id': 'allHolderRectId'
                                                  })
                                                  .drag(function(dx, dy) {
                                                        if(_scale < 0.3) return;

                                                        var tdx, tdy, xY, newMatrix, limitY, total,
                                                        snapInvMatrix = this.transform().diffMatrix.invert(),
                                                        stroke = _smallCanvasWidth * _transformCanvas[_scale].calculStroke;

                                                        snapInvMatrix.e = snapInvMatrix.f = 0;
                                                        tdx = snapInvMatrix.x(dx, dy);
                                                        tdy = snapInvMatrix.y(dx, dy);
                                                        this.transform(this.data('oldt') + 't' + [tdx, tdy]);
                                                        limitY = (_smallCanvasHeight - (smallCanvasObj.height - smallCanvasObj.stroke))/2;
                                                        total = this.transform().total;
                                                        total = total.substring(1);
                                                        total = total.split(',');

                                                        if(total[1] < -limitY){
                                                          total[1] = -limitY;
                                                        }
                                                        else if(total[1] > limitY){
                                                          total[1] = limitY;
                                                        }

                                                        if(total[0] < -stroke/4){
                                                          total[0] = - stroke/4;
                                                        }
                                                        else if(total[0] > stroke/4){
                                                          total[0] = stroke/4;
                                                        }

                                                        this.transform('t'+total[0]+','+total[1]);
                                                        xY = _transformCanvas[_scale].setXYPos;
                                                        newMatrix = _holder.transform().total.split(',');
                                                        newMatrix[0] = 't'+(-total[0] * 25 * _transformCanvas[_scale].calculStrokeDec + xY.x);
                                                        newMatrix[1] = (-total[1] * 25 * _transformCanvas[_scale].calculStrokeDec + xY.y) + 's' + _scale;
                                                        _holder.transform(newMatrix.toString());
                                                    }, function() {
                                                        if(_scale < 0.3) return;

                                                        this.data('oldt', this.transform());
                                                    }, function() {
                                                        $rootScope.reposiCanvas();
                                                    });
        };

        var _updatePannels = function(notUpdate){
          var obj, count = 0;
          var fn = function(o) {
                          return o._id == _panels[count].data._id;
                        };
          while(count < _panels.length) {
            obj = lodash.find(projectFx.info.arrays.objects, fn);

            if (obj){
              _panels[count].data = obj;
              if(!notUpdate) _panels[count].update();

              count++;
            }
            else{
              _panels.splice(count, 1);
            }
          }
        };

        var _translateMainCanvas = function(translateVector, easing, duration){
          if (translateVector.length > 0) {
              var myMatrix = new Snap.Matrix();

              myMatrix.translate(translateVector[0], translateVector[1]);
              _holder.animate({
                  transform: myMatrix
              }, duration, easing, function() {
                var total = _holder.transform().total;
                _scale = 1;
                _showAll();
                total = total.substring(1);
                total = total.split(',');

                if(_showAllHolderRect) _showAllHolderRect.transform('t'+(-total[0] * _realSmallScale)+','+(-total[1] * _realSmallScale));
              });
          }
        };

        var _showAll = function(){
          if(_showAllHolder) _showAllHolder.clear();

          _showAllHolder = Snap('#svgAllId');
          if(_showAllHolder){
            _showAllHolder.attr({
                            width: _smallCanvasWidth,
                            height: _smallCanvasHeight,
                            viewbox: '0 0 ' + _smallCanvasWidth + ' ' + _smallCanvasHeight
                          });

            _showAllHolderGroup = _showAllHolder.g();
          }

          _showAllHolderGroup.rect(0, 0, _smallCanvasWidth, _smallCanvasHeight)
                             .attr({
                               'fill': '#FFF',
                               'stroke': '#EEE',
                               'strokeWidth': 1
                             });

          _showAllHolderGSmall = _showAllHolderGroup.g();

          _drawSmallPanel();
          _drawMainShowAll();
        };

        var _moveWithKeyboard = function (varToUpdate, isAugment){
          var widthPanel, heightPanel, localObj,
          dep = isAugment ? 10 : -10,
          limitXMin = -_canvasWidth * 2,
          limitXMax = _canvasWidth * 3,
          limitYMin = -_canvasHeight * 2,
          limitYMax = _canvasHeight * 3;


          for (var i = 0; i < $rootScope.selectedPanels.length; i++) {
            localObj = _panels[$rootScope.selectedPanels[i]];
            widthPanel = (localObj.data.columns + 1) * (localObj.getCellWidth() + 1);
            heightPanel = (localObj.data.rows + 1) * (localObj.getCellHeight() + 1);

            if((varToUpdate === 'x' && $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] + dep > (limitXMin + localObj.getCellWidth()+1) && $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] + dep < (limitXMax - widthPanel)) || (varToUpdate === 'y' && $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] + dep > (limitYMin + localObj.getCellHeight()+3) && $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] + dep < (limitYMax - heightPanel))){
              $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] += dep;
              localObj.move($localStorage.ironridge[projectFx.info.id][localObj.data._id].x, $localStorage.ironridge[projectFx.info.id][localObj.data._id].y);
            }
            else {
              if(varToUpdate === 'x' && $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] + dep <= (limitXMin + localObj.getCellWidth()+1)){
                $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] = (limitXMin + localObj.getCellWidth()+1);
              }
              else if(varToUpdate === 'x' && $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] + dep >= (limitXMax - widthPanel)){
                $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] = limitXMax - widthPanel;
              }
              else if (varToUpdate === 'y' && $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] + dep <= (limitYMin + localObj.getCellHeight()+3)) {
                $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] = (limitYMin + localObj.getCellHeight()+3);
              }
              else if(varToUpdate === 'y' && $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] + dep >= (limitYMax - heightPanel)){
                $localStorage.ironridge[projectFx.info.id][localObj.data._id][varToUpdate] = limitYMax - heightPanel;
              }
            }
          }
        };

        var _setStage = function() {

          if(!angular.element('#holder')) return;

          if(_holderSvg) {
            //_holderSvg.clear();
            for(var count = 1; count < angular.element('#holder').children().length; count++){
              angular.element('#holder').children()[count].remove();
            }
          }

          _holderSvg = Snap('#holder');

          if(!_holderSvg) return;

          _holderSvg.attr({
                      width: _canvasWidth,
                      height: _canvasHeight,
                      viewbox: '0 0 ' + _canvasWidth + ' ' + _canvasHeight
                    });

          _holder = _holderSvg.g();
          $rootScope.customCanvasDrag();
          _holder.rect(-_canvasWidth * 2, -_canvasHeight * 2, _canvasWidth * 5, _canvasHeight * 5)
                 .attr({
                    'class': 'mainCanvas',
                    'fill': '#FFF',
                    'stroke': '#EEE',
                    'strokeWidth': 5
                 });
                 var myMatrix = new Snap.Matrix();
                 myMatrix.a =  myMatrix.d =_z1;
                 myMatrix.e = _x1;
                 myMatrix.f = _y1;
              _holder.transform( myMatrix);

          _holder.drag();
          _holder.name = 'mainCanvas';
          // _centerCanvas();
          $rootScope._canvasWidth = _canvasWidth;
          $rootScope._canvasHeight = _canvasHeight;
        };

        var _verifColision = function(pppanel, xNewPanel, yNewPanel, widthNewPanel, heightNewPanel, listePanel){
          var trans, x, y, width, height, xyFinal,
          posNewPanel = [xNewPanel,yNewPanel],
          limitXMax = _canvasWidth * 3  - (widthNewPanel),
          limitYMax = _canvasHeight * 3  - (heightNewPanel),
          holderWidth = angular.element('#holder').width(),
          holderHeight = angular.element('#holder').height();

          for(var count = 0; count < listePanel.length-1; count++){
          	trans = angular.element(listePanel[count]).attr('transform').split(',');
            x = Number(trans[trans.length-2]);
          	y = Number(trans[trans.length-1].split(')')[0]);
          	width = Number(angular.element(angular.element(angular.element(listePanel[count]).children('g')[1]).children('rect')[0]).attr('width'));
          	height = Number(angular.element(angular.element(angular.element(listePanel[count]).children('g')[1]).children('rect')[0]).attr('height'));

            if((xNewPanel >= x && xNewPanel <= x + width) || (xNewPanel + widthNewPanel >= x && xNewPanel + widthNewPanel <= x + width) || (x >= xNewPanel && x <= xNewPanel + widthNewPanel) || (x+width >= xNewPanel && x + width <= xNewPanel + widthNewPanel)){
              if((yNewPanel >= y && yNewPanel <= y + height) || (yNewPanel + heightNewPanel >= y && yNewPanel + heightNewPanel <= y + height) || (y >= yNewPanel && y <= yNewPanel + heightNewPanel) || (y + height >= yNewPanel && x + height <= yNewPanel + heightNewPanel)){
                if((x + width + 5) < holderWidth){
                  return _verifColision(pppanel, (x + width + 5), yNewPanel, widthNewPanel, heightNewPanel, listePanel);
                }
                else if((y + height + 5) < holderHeight){
                  return _verifColision(pppanel, 90, (y + height + 5), widthNewPanel, heightNewPanel, listePanel);
                }
                else{
                  xyFinal = [(x + width + 5),(y + height + 5)];

                  if((xyFinal[0]) > limitXMax){
                    xyFinal[0] = limitXMax - 5;
                  }

                  if((xyFinal[1]) > limitYMax){
                    xyFinal[1] = limitYMax;
                  }

                  return xyFinal;
                }
              }
            }
          }

          return posNewPanel;
        };

        var _updateOrientationStatus = function(){
          $rootScope.nbrPanelsPortrait = 0;
          $rootScope.nbrPanelsLandscape = 0;

          projectFx.info.arrays.objects.forEach(function(d) {
            if (d.portrait) {
              $rootScope.nbrPanelsPortrait++;
            } else {
              $rootScope.nbrPanelsLandscape++;
            }
          });

          if(projectFx.info.summary.cost === '$0'){
            $rootScope.nbrPanelsPortrait = 0;
            $rootScope.nbrPanelsLandscape = 0;
          }
        };

        var _draw = function(obj) {
            var pppanel = panelFx.instance(_holder);

            pppanel.draw(obj, _panels.length);

            if ($localStorage.ironridge[_projectId] && $localStorage.ironridge[_projectId][obj._id] && $localStorage.ironridge[_projectId][obj._id].x && $localStorage.ironridge[_projectId][obj._id].y) {
                pppanel.move($localStorage.ironridge[_projectId][obj._id].x, $localStorage.ironridge[_projectId][obj._id].y);
            } else {
              var translateVector,
              widthNewPanel = (pppanel.data.columns + 1) * (pppanel.getCellWidth() + 1),
              heightNewPanel = (pppanel.data.rows + 1) * (pppanel.getCellHeight() + 1),
              listePanel = angular.element('#holder').children('g').children('g'),
              yNewPanel = (_canvasHeight - heightNewPanel) / 2,
              xNewPanel = (_canvasWidth - widthNewPanel) / 2,
              posNewPanel = _verifColision(pppanel, xNewPanel, yNewPanel, widthNewPanel, heightNewPanel, listePanel);
              pppanel.move(posNewPanel[0], posNewPanel[1]);

              translateVector = [_canvasWidth/2  - (posNewPanel[0] + widthNewPanel/2), _canvasHeight/2 - (posNewPanel[1] + heightNewPanel/2)];
              _translateMainCanvas(translateVector, mina.linear, 0);
            }

            _panels.push(pppanel);

            return pppanel;
        };

        var _getPanel = function (id) {
            for (var count = 0; count < _panels.length; count++) {
                if(_panels[count].id == id){
                  return _panels[count];
                }
            }

            return null;
        };

        var _panelApply = function (action) {
          var currPannel;

          for (var i = 0; i < $rootScope.selectedPanels.length; i++) {
            currPannel = _getPanel($rootScope.selectedPanels[i]);

            if(currPannel){
                currPannel[action].call(arguments);
            }
          }
        };

        var _init = function() {
          var ob = projectFx.info.arrays.objects;
          _setStage();
          projectFx.info.arrays.objects.forEach(function(obj) {
            obj.cells = lodash.toArray(obj.cells);
          });

          _panels = [];
          
          for (var k in ob) {
            if(typeof k !== 'object'){
              ob = lodash.values(ob);
              _draw(ob[k]);
            }
          }

          if(_panels.length){
            $rootScope.disableDeleteOrientBtn();
            $scope.enableArraySaveBtn();
            _updateOrientationStatus();
          }
          else{
            $rootScope.disableDeleteOrientBtn();
            $scope.disableSaveBtn = true;
            $scope.disableArrayBtn = false;
          }

          _showAll();
        };

        var _centerCanvas = function() {
          var myMatrix = _holder.transform().globalMatrix,
          endX = Math.floor((_canvasWidth - _holder.getBBox().width) / 2),
          endY = Math.floor((_canvasHeight - _holder.getBBox().height) / 2),
          tx = Math.floor(endX - _holder.getBBox().x),
          ty = Math.floor(endY - _holder.getBBox().y);

          myMatrix.translate(tx/_scale, ty/_scale);
          _holder.transform(myMatrix);

          if(_scale === 0.2){
            myMatrix.translate(1.2/_scale, 0);
            _holder.transform(myMatrix);
          }

         if(_showAllHolderRect) _showAllHolderRect.transform('t' + (-tx * _realSmallScale) + ',' + (-ty * _realSmallScale));
        };
        /******************roof zone *********/
        $scope.chose_zone = function(zone){
          if (!$scope.selectedPanel) return ;
          $rootScope.zone_type = zone;
          $rootScope.roof_zone_paiting = true;
          angular.forEach(angular.element('.mainCanvas'), function(value, key){
            var a = angular.element(value);
            a.attr({class : 'mainCanvas zone' + zone + '_cursor'});
          });
        };
        function cancel_chose_zone(){
          $rootScope.roof_zone_paiting = false;
          angular.forEach(angular.element('.mainCanvas'), function(value, key){
            var a = angular.element(value);
            a.attr({class : 'mainCanvas'});
          });
        }
        /*****************************************************************/
        $scope.expandGrid = function() {
          $scope.expand = !$scope.expand;

          if ($scope.orientation){
            $scope.pGridRow = $scope.expand ? 12 : 8;
            $scope.pGridCol = $scope.expand ? 30 : 20;
          }
          else  {
            $scope.lGridRow = $scope.expand ? 20 : 12;
            $scope.lGridCol = $scope.expand ? 20 : 12;
           }
        };

        $scope.hovered = function(i, j) {
          if (!$scope.hover) $scope.hover = {};

          $scope.hover.row = i + 1;
          $scope.hover.col = j + 1;
          $scope.widthHovered = (i + 1) * ($scope.orientation ? 21 : 33) + 'px';
          $scope.heightHovered = (j + 1) * ($scope.orientation ? 33 : 21) + 'px';
        };

        $scope.onKeyUpPanel = function ($event) {
          if($event.keyCode === 27){
            $scope.isFullScreen = false;
            _reseizeFullScreen();
          }
          else if($event.keyCode === 46 || $event.keyCode === 8){
            $scope.onDeleteClick();
          }
          else if($event.keyCode === 37){
            _moveWithKeyboard('x', false);
          }
          else if($event.keyCode === 38){
            _moveWithKeyboard('y', false);
          }
          else if($event.keyCode === 39){
            _moveWithKeyboard('x', true);
          }
          else if($event.keyCode === 40){
            _moveWithKeyboard('y', true);
          }
        };

        $scope.disableArraySaveBtn = function(){
          $scope.disableArrayBtn = true;
          $scope.disableSaveBtn = true;
        };

        $scope.enableArraySaveBtn = function(){
          $scope.disableArrayBtn = false;
          $scope.disableSaveBtn = false;
        };

        $scope.onSelectorClick = function($event) {
          if($event) $event.stopPropagation();

          $scope.panelInput.Column = 0;
          $scope.panelInput.Row = 0;

          if(!$scope.disableArrayBtn){
            if ($rootScope.project.modules && projectFx.info.modules.model && projectFx.info.modules.model.id)
                $scope.selectorshow = !$scope.selectorshow;
            else
                alerts.show('manuf-model-not-set');
          }
        };

        $scope.onOrientClick = function($event) {
          if($event) $event.stopPropagation();

          if(!$scope.disableOrientBtn){
            $rootScope.isSaved = false;
            _panelApply('orient');
            _updatePannels(true);
            _drawSmallPanel();
          }
        };

        $scope.onSaveClick = function($event) {
          if($event) $event.stopPropagation();

          if(!$scope.disableSaveBtn){
            $rootScope.disableDeleteOrientBtn();
            $scope.disableArraySaveBtn();
            $rootScope.StopUpdateInOutClick = true;
            projectFx.updateArrays();
            _panels.forEach(function(p) {
                      p.unselect();
                    });
          }
        };

        $scope.onDeleteClick = function($event) {
          if($event) $event.stopPropagation();

          if(!$scope.disableDeleteBtn){
            $rootScope.isSaved = false;
            _panelApply('destroy');
            projectFx.info.arrays.objects = projectFx.info.arrays.objects.filter(Boolean);
            //projectFx.updateArrays();
            _updatePannels(true);
            _drawSmallPanel();
          }
        };

        $scope.goShowDimensions = function() {
          $rootScope.showDimension = !$rootScope.showDimension;
          _panels.forEach(function(p) {
                    p.showDimension();
                  });
        };

        $scope.hideSelector = function() {
          if($scope.selectorshow) {
            $scope.selectorshow = false;
          }
        };

        $scope.changeOrientation = function(detailMode){
          if(detailMode === 'portrait') {
            $scope.orientation = true;
            $scope.pGridRow = $scope.expand ? 12 : 8;
            $scope.pGridCol = $scope.expand ? 30 : 20;
          }
          else {
            $scope.orientation = false;
            $scope.lGridRow = $scope.expand ? 20 : 12;
            $scope.lGridCol = $scope.expand ? 20 : 12;
          }
        };

        $scope.addPanel = function(row, col, $event) {
          var panelObj, panelFx;
          if($event) $event.stopPropagation();

          $scope.enableArraySaveBtn();
          $rootScope.enableDeleteOrientBtn();
          $rootScope.isSaved = false;
          $scope.selectorshow = false;

          panelObj = {
            'rows': row,
            'columns': col,
            'portrait': $scope.orientation,
            'cells': [],
            '_id': Date.now(),
            'x' : 0,
            'y' : 0,
            'mounts': [],
            'bridges': []
          };

          projectFx.info.arrays.objects.push(panelObj);
          projectFx.info.arrays.count++;
          // should calculate x , y
          for (var j = 0; j < row; j++) {
            for (var i = 0; i < col; i++) {
              panelObj.cells.push({
                              x: i,
                              y: j,
                              active: true,
                              zone_type: 1
                            });
            }
          }

          panelObj.index = projectFx.info.arrays.objects.length - 1;
          panelFx = _draw(panelObj);
          //projectFx.updateArrays();
          panelFx.update();
          panelFx.save();
          panelFx.selectEffect();
          _updatePannels(true);

          if(_showAllHolderGSmall){
            _drawSmallPanel();
          }
          else{
            _showAll();
          }
        };

        $scope.zoomIn = function() {
          var myMatrix = new Snap.Matrix();
          _scale += 0.1;
          _scale = Math.round(_scale*10)/10;

          if(_scale > _maxZoom) _scale = _maxZoom;

          _zoomAnnim();
        };

        $scope.zoomOut = function() {
            var myMatrix = new Snap.Matrix();
            _scale -= 0.1;
            _scale = Math.round(_scale*10)/10;

            if(_scale < _minZoom) _scale = _minZoom;

            _zoomAnnim();
        };


        $scope.centerPanel = function($event, id){
          var x, y, withPanel, heightPanel, highlitedPanel, translateVector;
          $event.stopPropagation();

          for(var count = 0; count < _panels.length; count++){
            if(_panels[count].data._id == id){
              highlitedPanel = _panels[count];
              $scope.selectedPanel = id;
              break;
            }
          }

          highlitedPanel.selectEffect();
          x = $localStorage.ironridge[projectFx.info.id][id].x;
          y = $localStorage.ironridge[projectFx.info.id][id].y;
          withPanel = highlitedPanel.getCellWidth() * highlitedPanel.data.columns;
          heightPanel = highlitedPanel.getCellHeight() * highlitedPanel.data.rows;
          translateVector = [_canvasWidth/2  - (x + withPanel/2), _canvasHeight/2 - (y + heightPanel/2)];
          _translateMainCanvas(translateVector, mina.linear, 100);
        };

        $scope.showAllPanels = function($event){
          $event.stopPropagation();
          var myMatrix = new Snap.Matrix();

          _scale = 0.2;
          myMatrix.scale(_scale);
          _holder.transform(myMatrix);
          _centerCanvas();
          _showAll();
        };

        $scope.sowPreviewItem = function($event){
          $event.stopPropagation();

          if(projectFx.info.arrays.objects.length < 13) return;
          if($scope.pannelIndex > 0) $scope.pannelIndex--;
        };

        $scope.sowNextItem = function($event){
          $event.stopPropagation();

          if(projectFx.info.arrays.objects.length < 13) return;
          if($scope.pannelIndex < projectFx.info.arrays.objects.length - 12) $scope.pannelIndex++;
        };

        $scope.showHideMenuSelect = function(){
          if($scope.showMenuArray){
            $scope.showMenuArray = false;
            angular.element('#new-container').animate({bottom: ((_canvasHeight - 51) - $scope.panelHeight) + 'px'}, 400, function() {});
          }
          else{
            $scope.showMenuArray = true;
            angular.element('#new-container').animate({bottom: (_canvasHeight - $scope.panelHeight) + 'px'}, 400, function() {});
          }
        };

        $scope.goFullScreen = function(){
          $scope.isFullScreen = !$scope.isFullScreen;
          _reseizeFullScreen();
        };

        $rootScope.disableDeleteOrientBtn = function(){
          $scope.disableOrientBtn = true;
          $scope.disableDeleteBtn = true;
        };

        $rootScope.enableDeleteOrientBtn = function(){
          $timeout(function(){
            $scope.disableOrientBtn = false;
            $scope.disableDeleteBtn = false;
          });
        };

        $rootScope.customCanvasDrag = function() {
          _holder.drag(function(dx, dy) {
              if(!$rootScope.selectedPanels.length){
                var tdx, tdy, total, xY,
                snapInvMatrix = this.transform().diffMatrix.invert();
                snapInvMatrix.e = snapInvMatrix.f = 0;
                tdx = snapInvMatrix.x(dx, dy);
                tdy = snapInvMatrix.y(dx, dy);
                this.transform(this.data('oldt') + 't' + [tdx, tdy]);

                total = this.transform().local.substring(1);
                total = total.split(',');

                if(total[1]){
                  total[1] = total[1].split('s')[0];

                  if(_showAllHolderRect){
                    xY = _transformCanvas[_scale].setXYPosSmall;
                    _showAllHolderRect.transform('T' + (-total[0] * _smallScale + xY.x) + ',' + (-total[1] * _smallScale + xY.y));
                  }
                }
                //_holder.undrag();
              }
            }, function() {
                this.data('oldt', this.transform());
            }, function() {
              $rootScope.reposiCanvas();
            });
        };

        $rootScope.reposiCanvas = function(){
          if(!$rootScope.selectedPanels.length){
            //_holder.drag();
            var xY, localMatrix,
            total = _holder.transform().local.substring(1);
            total = total.split(',');

            if(total[1]){
              total[1] = total[1].split('s')[0];

              if(total[1] < (-(_canvasHeight * 2 *_scale) + (_canvasHeight - _canvasHeight * _scale))){
                total[1] = -(_canvasHeight * 2 *_scale)  + (_canvasHeight - _canvasHeight * _scale);
              }
              else if(total[1] > (_canvasHeight * 2 *_scale)){
                total[1] =  (_canvasHeight * 2 *_scale);
              }

              if(total[0] < (-(_canvasWidth * 2 *_scale)  + (_canvasWidth - _canvasWidth * _scale))){
                total[0] = -(_canvasWidth * 2 *_scale) + (_canvasWidth - _canvasWidth * _scale);
              }
              else if(total[0] > (_canvasWidth * 2 *_scale)){
                total[0] = (_canvasWidth * 2 *_scale);
              }

              localMatrix = _holder.transform().localMatrix;
              localMatrix.e = total[0];
              localMatrix.f = total[1];
              localMatrix = [localMatrix.a, 0, 0, localMatrix.d, localMatrix.e, localMatrix.f];
              _holder.transform('matrix('+localMatrix.toString()+')');

              if(_showAllHolderRect){
                xY = _transformCanvas[_scale].setXYPosSmall;
                _showAllHolderRect.transform('T' + (-total[0] * _smallScale + xY.x) + ',' + (-total[1] * _smallScale + xY.y));
              }
            }
          }
        };

        $rootScope.disableKeyDown = function(){
          $window.onkeydown = function(event) {
            if($state.tab === 'design' &&(event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40 || event.keyCode === 8)) {
              event.preventDefault();
            }
            //  else{
            //   var jqTarget = angular.element(event.target);
            //
            //   if (event.keyCode === 9) {
            //     var jqVisibleInputs = angular.element(':input:visible');
            //     jqFirst = angular.element('#attachments');
            //     jqLast = jqVisibleInputs.last();
            //
            //     if (!event.shiftKey && jqTarget.is(jqLast)) {
            //         event.preventDefault();
            //         angular.element('#attachments').focus();
            //     } else if (event.shiftKey && jqTarget.is(jqFirst)) {
            //         event.preventDefault();
            //         jqLast.focus();
            //     }
            //   }
            // }
          };
        };
        /********* Boutom tools event ******************************************/
        angular.element(document).ready(function () {
            if (_holder) {
              _holder.clear();
              _holder.clear();
            }
            _init();
          });

        $rootScope.$on('panel:selected', function(event, panelId) {
          var isChanged = false;

          _panels.forEach(function(p) {
            if (p.data._id != panelId) {
              if(!isChanged) $scope.selectedPanel = null;
              p.unselect();
            }
            else {
              isChanged = true;
              $scope.selectedPanel = panelId;
              $rootScope.enableDeleteOrientBtn();
            }
          });
          cancel_chose_zone();
        });

        $rootScope.$on('projectFx.redraw.arrays', function(){
          $scope.exceededCan = projectFx.info.arrays.danger;
          _init();
        });

        $rootScope.$on('projectFx.arrays.updated', function() {
            $scope.exceededCan = projectFx.info.arrays.danger;
            $scope.selectedPanel = null;
            $rootScope.StopUpdateInOutClick = false;
            _updatePannels();
            _updateOrientationStatus();
            $rootScope.disableKeyDown();

            if(_showAllHolderGSmall){
              _drawSmallPanel();
            }
            else{
              _showAll();
            }

            if(projectFx.info.arrays.objects.length){
              $scope.enableArraySaveBtn();
              $rootScope.disableDeleteOrientBtn();
            }
            else{
              $rootScope.disableDeleteOrientBtn();
              $scope.disableSaveBtn = true;
              $scope.disableArrayBtn = false;
            }
        });

        $rootScope.$on('projectFx.arrays.updated.error', function() {
          $scope.selectedPanel = null;

          if(projectFx.info.arrays.objects.length){
            $scope.enableArraySaveBtn();
          }
        });

        $rootScope.$on('panel:draged', function() {
          _updatePannels(true);
          _drawSmallPanel();
        });

        $window.onresize = function(){
          _x1 = _holder.matrix.e;
          _y1 = _holder.matrix.f;
          _z1 = _holder.matrix.a;
          if (_holder) {
            _holder.clear();
            _holder.clear();
          }
          _init();
           $scope.showMenuArray = false;
          _reseizeFullScreen();
          angular.element('#holderContainer').click();
        };

        $document.click(function() {
          if (!$rootScope.isSaved && !$rootScope.StopUpdateInOutClick && !$scope.selectorshow) {
             $scope.onSaveClick();
          }
          //$scope.hideAll = true;
        });

        // $rootScope.$on('model-selected', function () {
        //   $scope.updateModule();
        // });
        /****************************************************************************/
    });
})();
