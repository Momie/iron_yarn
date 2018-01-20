(function() {
  'use strict';
  angular.module('ironridge')
    .controller('substructureCtrl', function($scope, $rootScope, projectMount, $window,svgLoad, $timeout) {

       $scope.project = projectMount;
       //$scope.stateMaxSpan = 'initial';//newdesign
       var _svgBaseUrl = './assets/svg/';

       var _getsvgSubstructure = function(urlSvg){
            svgLoad.getsvg(urlSvg, false).then(function (result) {
              if(!result) return;

              var svgData = result.data ? result.data : new XMLSerializer().serializeToString(result.documentElement);
              angular.element('#substructureSvg').html(svgData);
              _updateSvgSubstructure();
            });
        };

        var _getsvgFoundation = function(urlSvg){
             svgLoad.getsvg(urlSvg, false).then(function (result) {
               if(!result) return;

               var svgData = result.data ? result.data : new XMLSerializer().serializeToString(result.documentElement);
               angular.element('#FoundationSvg').html(svgData);
               _updateSvgFoundation();
             });
         };

        var _getSvg = function(){
            _getsvgSubstructure( _svgBaseUrl + 'GB-Top-View.svg');
            _getsvgFoundation( _svgBaseUrl + 'GB-Side-View.svg');
        };

        var _updateSvg= function(){
          _updateSvgSubstructure();
          _updateSvgFoundation();
        };

        var _updateValue = function(obj, attr){
          if(obj && obj[attr] && (obj[attr].feet || obj[attr].feet === 0) && obj[attr].inches){
            return obj[attr].feet+'\''+ parseFloat(obj[attr].inches)+'\"';
          } else if (obj && obj[attr] && obj[attr].feet && !obj[attr].inches){
              return obj[attr].feet+'\'';
          } else{
            return '';
          }
        };

        var _updateRequiredRailLength = function(newRequiredRailValue){
          var dLineCopy,
          dLineCopyArray,
          dLineCopyStart,
          itemId,
          eche,
          xEnd,
          yEnd,
          xStart,
          yStart,
          item,
          bbox,
          x1,
          y1,
          y2,
          duration = 300,
          requiredRailWidth = 532,
          maxRequiredRail = 204,
          scaleRequiredRail = requiredRailWidth/maxRequiredRail,
          distance = scaleRequiredRail * $scope.project.info.foundation.cantilever,
          depla = [0,2.5, 3, 9, 7,9],
          initlaDep = 122;

          y1 = 18 + initlaDep;
          y2 = 18 + initlaDep + newRequiredRailValue * scaleRequiredRail;

          if(!Snap('#Line-Copy-17-Rail-Length')) return;
          Snap('#Line-Copy-17-Rail-Length').animate({'y1': y1, 'y2': y2}, duration, mina.easein);
          Snap('#Line-Copy-17-decoration-2-container').animate({transform: ('translate(0,'+ (y2 - 559) + ')')}, duration, mina.easein);
          Snap('#Line-Copy-17-decoration-1-container').animate({transform: ('translate(0,'+ initlaDep + ')')}, duration, mina.easein);

          for(var count = 0; count < 6; count++){
              itemId = '#path' + (7248 + 2 * count);

              x1 = angular.element(itemId).attr('x1');
              y1 = angular.element(itemId).attr('y1');

              if(count === 0) eche = Number(x1)/Number(y1);
              xEnd = initlaDep + newRequiredRailValue * scaleRequiredRail - distance;
              yEnd = xEnd/eche;
              xStart = initlaDep - distance;
              yStart = xStart/eche;
              Snap(itemId).animate({x1: (xEnd + count * 0.5), y1: (yEnd + depla[count]), x2: (xStart + count * 0.5), y2: (yStart + depla[count])}, duration, mina.easein);

              if(count === 0){
                Snap('#path7260').animate({x1: xEnd, y1: (10 + yEnd), x2: xEnd, y2: yEnd}, duration, mina.easein);
                Snap('#path7262').animate({x1: (xStart + 1), y1: (146 + yStart), x2: xStart, y2: (156 + yStart)}, duration, mina.easein);
                item = Snap('#Rail-Length');
                bbox = item.getBBox();
                item.animate({transform: ('translate('+ (xStart - (initlaDep + 16)) + ',' + (yStart-30)+ ')')}, duration, mina.easein);

                item = Snap('#REQUIRED-RAIL-TEXT-CONTAINER');
                bbox = item.getBBox();
                item.animate({transform: ('translate('+ ((newRequiredRailValue * scaleRequiredRail)/2 - 130) + ',' + (yStart)+ ')')}, duration, mina.easein);
              }
          }
        };

        var _toRightTransitionFoundation = function(newPierSpacingValue, newNorthAbove, newNorthEdgeClearance, newSouhEdgeClearance, newSouthAbove, newBelowValue, newHoleDepthValue, newRequiredRail, newHoleDiameter){
          var newValue,
            tempValue,
            newPos,
            dLineCopy,
            dLineCopyArray,
            dLineCopyStart,
            dLineCopyEnd,
            xEnd,
            xStart,
            yEnd,
            yStart,
            x1,
            y1,
            x2,
            y2,
            item,
            bbox,
            step,
            width,
            height,
            center,
            nNsPierWidth = 532,
            maxNsPier = 204,
            scaleNsPier = nNsPierWidth/maxNsPier,
            distance = scaleNsPier * $scope.project.info.foundation.cantilever,
            duration = 300,
            northAboveWidth = 198,
            maxNorthAbover = 156,
            scaleNorthAbove = northAboveWidth/maxNorthAbover,
            trans = newPierSpacingValue * scaleNsPier - 300,
            arrayAngle = {
                             '0' :{angle : 0, transY : 120, northEdgeAugment : 7, southEdgeAugment : 7, startOval : 99, matrix : 'matrix(1,0,0,1,0,-53)'},
                             '5' : {angle : -2.4, transY : 121, northEdgeAugment : 8, southEdgeAugment : 7, startOval : 93, matrix : 'matrix(0.9991,-0.0419,0.0419,0.9991,-8,-48.2401)'},
                             '10' : {angle : -4.6, transY : 123, northEdgeAugment : 8.5, southEdgeAugment : 7, startOval : 87.5, matrix : 'matrix(0.9968,-0.0802,0.0802,0.9968,-17,-43.3708)'},
                             '15' : {angle : -7.2, transY : 125, northEdgeAugment : 9.5, southEdgeAugment : 7, startOval : 85, matrix : 'matrix(0.9921,-0.1253,0.1253,0.9921,-28,-36.5)'},
                             '20' : {angle : -9.7, transY : 132, northEdgeAugment : 10.5, southEdgeAugment : 7, startOval : 76, matrix : 'matrix(0.9857,-0.1685,0.1685,0.9857,-37,-30.5)'},
                             '25' : {angle : -12.8, transY : 138, northEdgeAugment : 14, southEdgeAugment : 5, startOval : 73, matrix : 'matrix(0.9751,-0.2215,0.2215,0.9751,-48,-20.5)'},
                             '30' : {angle : -15.5, transY : 147, northEdgeAugment : 17, southEdgeAugment : 5, startOval : 68, matrix : 'matrix(0.9636,-0.2672,0.2672,0.9636,-58,-12)'},
                             '35' : {angle : -19, transY : 157, northEdgeAugment : 25, southEdgeAugment : 2, startOval : 60, matrix : 'matrix(0.9455,-0.3256,0.3256,0.9455,-70,1)'},
                             '40' : {angle : -22, transY : 171, northEdgeAugment : 34, southEdgeAugment : 2, startOval : 50, matrix : 'matrix(0.9272,-0.3746,0.3746,0.9272,-80,10.5)'},
                             '45' : {angle : -26, transY : 188, northEdgeAugment : 50, southEdgeAugment : 2, startOval : 41, matrix : 'matrix(0.8988,-0.4384,0.4384,0.8988,-90,24.5)'}
                         };

            if(!Snap('#horizontal-translate-group')) return;

            Snap('#horizontal-translate-group').animate({transform: ('translate(' + trans + ', 8)')}, duration, mina.easein);
            Snap('#N-Pier').animate({transform: ('translate(' + (430 + trans) + ', 48)')}, duration, mina.easein);
            newValue = Math.max((arrayAngle[$scope.project.info.foundation.angle].transY  + newPierSpacingValue * scaleNsPier + distance), 470);
            Snap('#North-Clear').animate({transform: ('translate(' + newValue + ', 48)')}, duration, mina.easein);
            Snap('#Edge-Clear').animate({transform: ('translate(' + Math.min((123 - distance), 92) + ', 195)')}, duration, mina.easein);


            x1 = angular.element('#Line-Copy-6-Foundation').attr('x1');
            xStart = Number(x1);
            xEnd = xStart + newPierSpacingValue * scaleNsPier;
            Snap('#Line-Copy-6-Foundation').animate({x2: xEnd}, duration, mina.easein);

            trans = (xEnd - xStart)/2 - 42;
            Snap('#ns-pier-spac-foundation-text').animate({transform: ('translate(' + trans + ', 0)')}, duration, mina.easein);

            Snap('#path-5').animate({height: newNorthAbove * scaleNorthAbove + 5}, duration, mina.easein);
            y1 = angular.element('#path-5').attr('y');
            newPos = 35 + 231 - (Number(y1) + newNorthAbove * scaleNorthAbove + 5);
            Snap('#diagonal-translate-group').animate({transform: ('translate(16,' + newPos + ')')}, duration, mina.easein);

            y2 = angular.element('#Line-Copy-9-Foundation').attr('y2');
            yEnd = Number(y2);
            yStart = yEnd - newNorthAbove * scaleNorthAbove - 6;
            Snap('#Line-Copy-9-Foundation').animate({y1: yStart}, duration, mina.easein);


            Snap('#arrow-above-foudation').animate({transform: ('translate(0,' + yStart + ')')}, duration, mina.easein);
            trans = yEnd - (newNorthAbove * scaleNorthAbove)/2;
            Snap('#northAboveText').animate({transform: ('translate(0,' + trans + ')')}, duration, mina.easein);

            y2 = angular.element('#Line-Copy-18-north-clear').attr('y2');
            yEnd = Number(y2);
            yStart = yEnd - newNorthEdgeClearance * scaleNorthAbove - 5 - arrayAngle[$scope.project.info.foundation.angle].northEdgeAugment;
            Snap('#Line-Copy-18-north-clear').animate({y1: yStart}, duration, mina.easein);
            Snap('#North-Clear-arraow').animate({transform: ('translate(0,' + yStart + ')')}, duration, mina.easein);

            trans = yEnd - (newNorthEdgeClearance * scaleNorthAbove)/2 - 20;
            Snap('#North-Clear-text').animate({transform: ('translate(0,' + trans + ')')}, duration, mina.easein);

            y2 = angular.element('#Line-Copy-18-Edge-Clear').attr('y2');
            yEnd = Number(y2);
            yStart = yEnd - newSouhEdgeClearance * scaleNorthAbove - 5 - arrayAngle[$scope.project.info.foundation.angle].southEdgeAugment;
            Snap('#Line-Copy-18-Edge-Clear').animate({y1: yStart}, duration, mina.easein);

            Snap('#Edge-Clear-arraow').animate({transform: ('translate(0,' + yStart + ')')}, duration, mina.easein);

            trans = yEnd - (newSouhEdgeClearance * scaleNorthAbove)/2 - 12;
            Snap('#Edge-Clear-text').animate({transform: ('translate(0,' + trans + ')')}, duration, mina.easein);

            y2 = angular.element('#Line-Copy-9-above').attr('y2');
            yEnd = Number(y2);
            yStart = yEnd - newSouthAbove * scaleNorthAbove - 4;
            Snap('#Line-Copy-9-above').animate({y1: yStart}, duration, mina.easein);

            Snap('#Line-Copy-10-above-arrow').animate({transform: ('translate(0,' + (yStart - 2) + ')')}, duration, mina.easein);

            trans = yEnd - (newSouthAbove * scaleNorthAbove)/2 - 12;
            Snap('#AGL-text-above').animate({transform: ('translate(0,' + trans + ')')}, duration, mina.easein);

            Snap('#path-1').animate({height : newBelowValue * scaleNorthAbove}, duration, mina.easein);
            Snap('#path-3').animate({height : newBelowValue * scaleNorthAbove}, duration, mina.easein);

            y1 = angular.element('#path-3').attr('y');
            trans = Number(y1) + newBelowValue * scaleNorthAbove;
            Snap('#NSpierspacingId').animate({transform: ('translate(142,' +  (trans + 5) + ')')}, duration, mina.easein);
            Snap('#nspierSpacingArrowId').animate({transform: ('translate(138,' +  (trans + 5) + ')')}, duration, mina.easein);

            y1 = angular.element('#Line-Copy-bgl-14').attr('y1');
            yStart = Number(y1);
            yEnd = yStart + newBelowValue * scaleNorthAbove - 5;
            Snap('#Line-Copy-bgl-14').animate({y2: yEnd}, duration, mina.easein);

            y1 = angular.element('#Line-Copy-spier-14').attr('y1');
            yStart = Number(y1);
            yEnd = yStart + newBelowValue * scaleNorthAbove -5;
            Snap('#Line-Copy-spier-14').animate({y2: yEnd}, duration, mina.easein);

            trans = (yEnd - yStart)/2 - 13;
            Snap('#bglTextBelow').animate({transform: ('translate(0,' + trans + ')')}, duration, mina.easein);
            Snap('#spierTextBelow').animate({transform: ('translate(6,' + (100 + trans) + ')')}, duration, mina.easein);

            trans = newBelowValue * scaleNorthAbove - 85 - 12;
            Snap('#spierArrowBelow').animate({transform: ('translate(0,' +  trans + ')')}, duration, mina.easein);
            Snap('#bglArrowBelow').animate({transform: ('translate(0,' +  trans + ')')}, duration, mina.easein);

            x1 = angular.element('#Rectangle-4-Copy-2').attr('x');
            width = angular.element('#Rectangle-4-Copy-2').attr('width');
            center = Number(x1) + Number(width)/2;
            xStart = center - (newHoleDiameter * scaleNsPier)/2 - 119;
            xEnd = center + (newHoleDiameter * scaleNsPier)/2 - 119;
            Snap('#Rectangle-4-Copy-2').animate({x: (center - (newHoleDiameter * scaleNsPier)/2), height : (newHoleDepthValue * scaleNorthAbove), width : (newHoleDiameter * scaleNsPier)}, duration, mina.easein);

            x1 = angular.element('#Rectangle-4-Copy-3').attr('x');
            width = angular.element('#Rectangle-4-Copy-3').attr('width');
            center = Number(x1) + Number(width)/2;
            Snap('#Rectangle-4-Copy-3').animate({x: (center - (newHoleDiameter * scaleNsPier)/2), height : (newHoleDepthValue * scaleNorthAbove), width : (newHoleDiameter * scaleNsPier)}, duration, mina.easein);

            Snap('#Line-Copy-21').animate({y1 : (xStart + 1), y2 : (xEnd - 2)}, duration, mina.easein);

            Snap('#Hole-Diameter-arrow-1').animate({transform: ('translate(0,' + xStart + ')')}, duration, mina.easein);
            Snap('#Hole-Diameter-arrow-2').animate({transform: ('translate(0,' + (xStart + newHoleDiameter * scaleNsPier - 49) + ')')}, duration, mina.easein);
            Snap('#Hole-Diameter-container').animate({transform: ('translate(0,' +  (newHoleDepthValue * scaleNorthAbove - 135) + ')')}, duration, mina.easein);

            y1 = angular.element('#Line-Copy-23').attr('y1');
            yStart = Number(y1);
            yEnd = yStart + newHoleDepthValue * scaleNorthAbove - 2;
            Snap('#Line-Copy-23').animate({y2: yEnd}, duration, mina.easein);

            trans = (yEnd - yStart)/2 - 13;
            Snap('#minHoleText').animate({transform: ('translate(0,' + trans + ')')}, duration, mina.easein);

            trans = newHoleDepthValue * scaleNorthAbove - 148;
            Snap('#minHoleArrow').animate({transform: ('translate(0,' +  trans + ')')}, duration, mina.easein);

            item = Snap('#horizontal-bars-id');
            bbox = item.getBBox();
            //item.animate({ transform: 't0,' + arrayAngle[$scope.project.info.foundation.angle].transY + 'r' + arrayAngle[$scope.project.info.foundation.angle].angle + ',' + bbox.cx + ',' + bbox.cy + 's1,1,' + bbox.cx + ',' + bbox.cy}, duration, mina.easein);
            item.animate({ transform: arrayAngle[$scope.project.info.foundation.angle].matrix}, duration, mina.easein);

            item = Snap('#REQUIRED-RAIL');
            bbox = item.getBBox();
            item.animate({ transform: 't0,0r' + (-arrayAngle[$scope.project.info.foundation.angle].angle) + ',' + bbox.cx + ',' + bbox.cy + 's1,1,' + bbox.cx + ',' + bbox.cy}, duration, mina.easein);

            item = Snap('#rect-rotation1');
            bbox = item.getBBox();
            item.animate({ transform: 'r' + (14 +arrayAngle[$scope.project.info.foundation.angle].angle) + ',' + bbox.cx + ',' + bbox.cy + 's1,1,' + bbox.cx + ',' + bbox.cy}, duration, mina.easein);

            item = Snap('#rect-rotation2');
            bbox = item.getBBox();
            item.animate({ transform: 'r' + (14 + arrayAngle[$scope.project.info.foundation.angle].angle) + ',' + bbox.cx + ',' + bbox.cy + 's1,1,' + bbox.cx + ',' + bbox.cy}, duration, mina.easein);

            step = (151 - arrayAngle[$scope.project.info.foundation.angle].startOval)/6;

            dLineCopy = angular.element('#ovalPath').attr('d');

            if(dLineCopy){
              dLineCopyArray = dLineCopy.split(' ');

              if(dLineCopyArray[1]){
                dLineCopyStart = dLineCopyArray[1].split(',');
                dLineCopyStart[1] = arrayAngle[$scope.project.info.foundation.angle].startOval + (6 - 1/2) * step;
                dLineCopyStart[1] = dLineCopyStart[1].toFixed(6);
                dLineCopyArray[1] = dLineCopyStart.toString();
              }

              if(dLineCopyArray[2]){
                dLineCopyStart = dLineCopyArray[2].split(',');
                dLineCopyStart[1] = arrayAngle[$scope.project.info.foundation.angle].startOval + (6 - 1) * step;
                dLineCopyStart[1] = dLineCopyStart[1].toFixed(6);
                dLineCopyArray[2] = dLineCopyStart.toString();
              }

              if(dLineCopyArray[3]){
                dLineCopyStart = dLineCopyArray[3].split(',');
                dLineCopyStart[1] = arrayAngle[$scope.project.info.foundation.angle].startOval + (6 - 2) * step;
                dLineCopyStart[1] = dLineCopyStart[1].toFixed(6);
                dLineCopyArray[3] = dLineCopyStart.toString();
              }

              if(dLineCopyArray[4]){
                dLineCopyStart = dLineCopyArray[4].split(',');
                dLineCopyStart[1] = arrayAngle[$scope.project.info.foundation.angle].startOval + (6 - 4) * step;
                dLineCopyStart[1] = dLineCopyStart[1].toFixed(6);
                dLineCopyArray[4] = dLineCopyStart.toString();
              }

              if(dLineCopyArray[5]){
                dLineCopyStart = dLineCopyArray[5].split(',');
                dLineCopyStart[1] = arrayAngle[$scope.project.info.foundation.angle].startOval + (6 - 5) * step;
                dLineCopyStart[1] = dLineCopyStart[1].toFixed(6);
                dLineCopyArray[5] = dLineCopyStart.toString();
              }

              if(dLineCopyArray[6]){
                dLineCopyStart = dLineCopyArray[6].split(',');
                dLineCopyStart[1] = arrayAngle[$scope.project.info.foundation.angle].startOval;
                dLineCopyStart[1] = dLineCopyStart[1].toFixed(6);
                dLineCopyArray[6] = dLineCopyStart.toString();
              }

              newValue = dLineCopyArray.join(' ');
              angular.element('#ovalPath').attr('d',newValue);
            }

            Snap('#angle_id').animate({y: (68 + (arrayAngle[$scope.project.info.foundation.angle].startOval)/2)}, duration, mina.easein);
            Snap('#symbol-angle-id').animate({y: (60 + (arrayAngle[$scope.project.info.foundation.angle].startOval)/2)}, duration, mina.easein);
        };

        var _toLeftTransition = function(newPierSpacingValue, newPierSpacingRealValue){
          if(!newPierSpacingValue) return;
          var totalPierSpacing = 20,
          nbreEWPeirSpacing = totalPierSpacing/newPierSpacingValue,
          pierSpacingWidth = 550,
          scale = pierSpacingWidth/totalPierSpacing,
          duration = 300,
          dLineCopy,
          dLineCopyArray,
          dLineCopyStart,
          dLineCopyEnd,
          xEnd,
          xStart,
          newValue,
          trans;

          for(var count = 1; count < 11; count++){
            var item = '#Group-EW-Pier-Spacing-' + count;
            var itemBottom = '#Group-EW-Pier-Spacing-Bottom-' + count;
            var itemGroup = '#LinePierSpaccing-Group-' + count;
            if(count > 1){
              trans =  count <= Math.ceil(nbreEWPeirSpacing) ? 7.5  +  scale * (count - 1) * newPierSpacingValue : 580;
              Snap(item).animate({transform: ('translate('+ trans +',0)')}, duration, mina.easein);
              Snap(itemBottom).animate({transform: ('translate('+ trans +',230)')}, duration, mina.easein);
            }

            item = '#LinePierSpaccing-' + count;

            if(count < Math.ceil(nbreEWPeirSpacing)){
              xStart = (newPierSpacingValue * scale*(count - 1));
              xEnd =  (newPierSpacingValue * scale*count);
              if(!Snap(item)) return;
              Snap(item).animate({x1 : xStart, x2 : xEnd}, duration, mina.easein);

              trans =  ((count - 1 + 0.5) * newPierSpacingValue * scale) - 30;
              Snap(itemGroup).animate({transform: ('translate(' + trans + ', 0)')}, duration, mina.easein);
              Snap('#GLine-Copy-12-decoration-'+count).animate({transform: ('translate(' + (count * newPierSpacingValue * scale - 266) + ', 0)')}, duration, mina.easein);
              angular.element('#pierSpacing' + count).text(newPierSpacingRealValue);
              if(count !== 1) Snap('#GLine-12-decoration-'+count).animate({transform: ('translate(' + ((count - 1) * newPierSpacingValue * scale - 266) + ', 0)')}, duration, mina.easein);
            }
            else{
              Snap(item).animate({x1 : 600, x2 : 600}, duration, mina.easein);
              Snap(itemGroup).animate({transform: ('translate(600, 0)')}, duration, mina.easein);
              Snap('#GLine-Copy-12-decoration-'+count).animate({transform: ('translate(600, 0)')}, duration, mina.easein);
              Snap('#GLine-12-decoration-'+count).animate({transform: ('translate(600, 0)')}, duration, mina.easein);
              angular.element('#pierSpacing' + count).text(newPierSpacingValue);
            }
          }
        };

        var _toBottomTransition = function(newNsPierValue){
          var item,
          shapeStartY,
          dLineCopy,
          dLineCopyArray,
          dLineCopyStart,
          dLineCopyEnd,
          newValue,
          trans,
          yEnd,
          yStart,
          tempValue,
          yEndGlobal,
          nNsPierWidth = 230,
          maxNsPier = 9,
          scaleNsPier = nNsPierWidth/maxNsPier,
          duration = 300;
          if(!Snap('#Line-Copy-9')) return;
          yEnd = Number(angular.element('#Line-Copy-9').attr('y2'));
          yStart = yEnd - (newNsPierValue * scaleNsPier);
          yEndGlobal = yEnd;
          Snap('#Line-Copy-9').animate({y1 : yStart}, duration, mina.easein);

          Snap('#containerGroupTop').animate({transform: ('translate(0, '+ yStart +')')}, duration, mina.easein);
          Snap('#North').animate({transform: ('translate(0, '+ yStart +')')}, duration, mina.easein);
          Snap('#GroupTopTopCaps').animate({transform: ('translate(0, '+ yStart +')')}, duration, mina.easein);
          Snap('#NorthGroup').animate({transform: ('translate(0, '+ yStart +')')}, duration, mina.easein);
          Snap('#containerline10').animate({transform: ('translate(0, '+ yStart +')')}, duration, mina.easein);

          trans = yStart + (newNsPierValue * scaleNsPier)/2 - 13;
          Snap('#containerTextNSPier').animate({transform: ('translate(0, '+ trans +')')}, duration, mina.easein);

          shapeStartY = yEndGlobal - ( newNsPierValue * scaleNsPier);

          for(var count = 9; count < 18; count++) {
            for(var subCount = 1; subCount < 5; subCount++) {
              item = '#Shape-Group-' + count + '-' + subCount;
              Snap(item).animate({y2 : shapeStartY}, duration, mina.easein);
            }

            tempValue = shapeStartY.toFixed(6);

            item = '#Shape-Group-' + count + '-5';
            dLineCopy = angular.element(item).attr('points');
            dLineCopyArray = dLineCopy.split(' ');
            dLineCopyStart = dLineCopyArray[2].split(',');
            dLineCopyStart[1] = tempValue;
            dLineCopyArray[2] = dLineCopyStart.join(',');
            dLineCopyStart = dLineCopyArray[3].split(',');
            dLineCopyStart[1] = tempValue;
            dLineCopyArray[3] = dLineCopyStart.join(',');
            newValue = dLineCopyArray.join(' ');
            angular.element(item).attr('points',newValue);
          }

          Snap('#containerGroupTop').animate({transform: ('translate(0, '+ (shapeStartY) +')')}, duration, mina.easein);

          newValue = 165 + (newNsPierValue * scaleNsPier);
          dLineCopy = angular.element('#polyline2').attr('points');
          dLineCopyArray = dLineCopy.split(' ');

          dLineCopyStart = dLineCopyArray[5].split(',');
          dLineCopyEnd = dLineCopyArray[0].split(',');
          dLineCopyEnd[0] = (parseFloat(dLineCopyStart[0]) - newValue).toFixed(6);
          dLineCopyArray[0] = dLineCopyEnd.join(',');

          tempValue = parseFloat(dLineCopyEnd[0]);
          dLineCopyEnd = dLineCopyArray[1].split(',');
          dLineCopyEnd[0] =  (tempValue + newValue/2).toFixed(6);
          dLineCopyArray[1] = dLineCopyEnd.join(',');

          tempValue = parseFloat(dLineCopyEnd[0]);
          dLineCopyEnd = dLineCopyArray[2].split(',');
          dLineCopyEnd[0] =  (tempValue + 5.6).toFixed(6);
          dLineCopyArray[2] = dLineCopyEnd.join(',');

          tempValue = parseFloat(dLineCopyEnd[0]);
          dLineCopyEnd = dLineCopyArray[3].split(',');
          dLineCopyEnd[0] =  (tempValue + 4.2).toFixed(6);
          dLineCopyArray[3] = dLineCopyEnd.join(',');

          tempValue = parseFloat(dLineCopyEnd[0]);
          dLineCopyEnd = dLineCopyArray[4].split(',');
          dLineCopyEnd[0] =  (tempValue + 5.6).toFixed(6);
          dLineCopyArray[4] = dLineCopyEnd.join(',');

          $('#polyline2').attr('points', (dLineCopyArray.join(' ')));
        };

        var _updateSvgSubstructure = function() {
          if(!$scope.project.info.substructure.ew_pier_spacing){
            svgLoad.getsvg(_svgBaseUrl + 'GB-Top-View.svg', false).then(function (result) {
                angular.element('#substructureSvg').html(result.data);
            });

            return;
          }


          var newNsPierValue = _updateValue($scope.project.info.substructure, 'ns_pier_spacing');

          // angular.element('#pierSpacing1').text(newPierSpacingValue);
          // angular.element('#pierSpacing2').text(newPierSpacingValue);
          angular.element('#N-S-PIER').text(newNsPierValue);

          var newPierSpacingRealValue = $scope.project.info.substructure.desired_ew_pier_spacing.use_max_spacing ? _updateValue($scope.project.info.substructure, 'ew_pier_spacing') : _updateValue($scope.project.info.substructure, 'max_span')/*$scope.project.info.substructure.desired_ew_pier_spacing.max_spacing*/;

          var newPierSpacingValue = newPierSpacingRealValue;
          /*if($scope.project.info.substructure.desired_ew_pier_spacing.use_max_spacing ) */newPierSpacingValue = Number(newPierSpacingValue.replace('.' , '').replace('\'' , '.').replace('\"' , ''));
          newNsPierValue = Number(newNsPierValue.replace('\'' , '.').replace('\"' , ''));

          _toLeftTransition(newPierSpacingValue, newPierSpacingRealValue);
          _toBottomTransition(newNsPierValue);
        };

        var _updateSvgFoundation = function() {
          if(!$scope.project.info.foundation.north_edge_clearance || !$scope.project.info.foundation.north_edge_clearance.feet){
            svgLoad.getsvg(_svgBaseUrl + 'GB-Side-View.svg', false).then(function (result) {
                  angular.element('#FoundationSvg').html(result.data);
            });

            return;
          }

          var newPierSpacingValue = _updateValue($scope.project.info.foundation, 'ns_pier_spacing');
          var newNorthAbove = _updateValue($scope.project.info.foundation, 'north_above');
          var newSouthAbove = _updateValue($scope.project.info.foundation, 'south_above');
          var newBelow = _updateValue($scope.project.info.foundation, 'south_below');
          var newBellowNorth = _updateValue($scope.project.info.foundation, 'north_below');
          var newHoleDepthValue = _updateValue($scope.project.info.foundation, 'minimum_hole_depth');
          var newNorthEdgeClearance = _updateValue($scope.project.info.foundation, 'north_edge_clearance');
          var newSouthEdgeClearance = _updateValue($scope.project.info.foundation, 'south_edge_clearance');
          var newRequiredRail = _updateValue($scope.project.info.foundation, 'required_rail');
          var newHoleDiameter = $scope.project.info.foundation.hole_diameter;

          angular.element('#PIER_SPACING').text(newPierSpacingValue);
          angular.element('#NORTH_ABOVE').text(newNorthAbove);
          angular.element('#SOUTH_ABOVE').text(newSouthAbove);
          angular.element('#NORTH_BELOW').text(newBellowNorth);
          angular.element('#SOUTH_BELOW').text(newBelow);
          angular.element('#MINIMUM_HOLE_DEPETH').text(newHoleDepthValue);
          angular.element('#NORTH_EDGE_CLEARANCE').text(newNorthEdgeClearance);
          angular.element('#SOUTH_EDGE_CLEARINCE').text(newSouthEdgeClearance);
          angular.element('#REQUIRED_RAIL').text(newRequiredRail);
          angular.element('#HOLE_DIAMETER_').text($scope.project.info.foundation.hole_diameter+'\"');
          angular.element('#angle_id').text($scope.project.info.foundation.angle);

          newPierSpacingValue = parseFloat($scope.project.info.foundation.ns_pier_spacing_inches);
          newNorthAbove = parseFloat($scope.project.info.foundation.north_above_inches);
          newBelow = parseFloat($scope.project.info.foundation.south_below_inches);
          newHoleDepthValue = parseFloat($scope.project.info.foundation.minimum_hole_depth_inches);
          newNorthEdgeClearance = parseFloat($scope.project.info.foundation.north_edge_clearance_inches);
          newSouthEdgeClearance = parseFloat($scope.project.info.foundation.south_edge_clearance_inches);
          newSouthAbove = parseFloat($scope.project.info.foundation.south_above_inches);
          newRequiredRail = parseFloat($scope.project.info.foundation.required_rail_inches);

          _updateRequiredRailLength(newRequiredRail);
          _toRightTransitionFoundation(newPierSpacingValue, newNorthAbove, newNorthEdgeClearance, newSouthEdgeClearance, newSouthAbove, newBelow, newHoleDepthValue, newRequiredRail, newHoleDiameter);

         };

         var _postdata= function(attr){
            projectMount.info.summary = attr.summary;
            projectMount.info.bill_of_material = attr.bill_of_material;
            projectMount.info.documents = attr.documents;
            projectMount.info.substructure= attr.substructure;
            projectMount.info.foundation= attr.foundation;
            projectMount.info.arrays = attr.arrays;
            projectMount.info.reaction_forces=attr.reaction_forces;
            projectMount.info.third_party_material = attr.third_party_material;
            projectMount.info.arrays_details = attr.arrays_details;

            _updateSvgSubstructure();
            _updateSvgFoundation();
          };

          $scope.updateSubstructure = function() {
             projectMount.postData('substructure').then(function(result) {
               //if($scope.stateMaxSpan === 'editing') $scope.stateMaxSpan = 'edited';//newdesign
               _postdata(result.data);
             });
         };


         $scope.updateFoundation = function() {
           projectMount.postData('foundation').then(function(result) {
             _postdata(result.data);
           });
         };
         $scope.updateFoundationSoil = function() {
           projectMount.info.foundation.soil_class = Number(projectMount.info.foundation.soil_class);
           projectMount.postData('foundation').then(function(result) {
             _postdata(result.data);
           });
         };

         $scope.parseFloat = function (n){
           return parseFloat(n);
         };

         ////newdesign
        //  $scope.changeStateFrom = function(fromState){
        //    if(fromState === 'initial'){
        //       $scope.stateMaxSpan  = 'editing';
        //       $timeout(function () {
        //         angular.element('.input-span').focus();
        //       });
         //
        //    }
        //    else if(fromState === 'editing'){
        //      projectMount.info.substructure.desired_ew_pier_spacing.use_max_spacing = false;
        //      $scope.updateSubstructure();
        //    }
        //    else if(fromState === 'edited'){
        //      $scope.stateMaxSpan  = 'initial';
        //      projectMount.info.substructure.desired_ew_pier_spacing.use_max_spacing = true;
        //      $scope.updateSubstructure();
        //    }
        //  };
        //  $scope.SoilSelectMount = function() {
        //    projectMount.postData({
        //      'soil_class':$scope.project.info.foundation.soil_class
        //    }, true).then(function(result) {
        //      _postdata(result.data);
        //    });
        //  };
         //
        //  $scope.HoleSelectMount = function() {
        //    projectMount.postData({
        //      'hole':$scope.project.info.foundation.hole_diameter.hole
        //    }, true).then(function(result) {
        //      _postdata(result.data);
        //    });
        //  };

         _getSvg();

         $rootScope.$on('projectMount.redraw.arrays', function(){
          _updateSvg();
           console.log('after loading',$scope.project);
         });

         $rootScope.$on('projectMount.arrays.updated', function(){
          _updateSvg();
           console.log('upadte svg value');
         });

    });
})();
