(function() {
    'use strict';

    angular.module('ironridge')
        .service('panelFx', function($rootScope, $http, $timeout, projectFx, lodash, $localStorage) {

            var _fillCss = {
                arrow: {
                    stroke: '#777',
                    fill: 'none',
                    cursor: 'hand',
                    'fill-opacity': 1,
                    'strokeWidth': 5
                },
                emptyBox: {
                    stroke: '#EAEAEA',
                    'strokeWidth': 0.6,
                    cursor: 'hand',
                    fill: '#54A4FF',
                    opacity: 0.2
                },
                outerFrame: {
                    stroke: '#71A6E3',
                    fill: '#FFF',
                    cursor: 'hand',
                    'strokeWidth': 0
                },
                outerFrameBackGround: {
                    stroke: '#FFF',
                    fill: '#FFF',
                    cursor: 'hand',
                    'strokeWidth': 0,
                    opacity: 0.7,
                    'filter': 'url("#drop-shadow")'
                },
                transparent: {
                    'stroke-opacity': 0
                },
                opaque: {
                    'stroke-opacity': 1
                },
                dimensionLine: {
                    stroke: '#777',
                    fill: 'none',
                    cursor: 'hand',
                    'fill-opacity': 1,
                    'strokeWidth': 0.5
                },
                dimensionText:{
                  'font-family': 'Open Sans',
                  'font-size': 12,
                  'font-weight': '400',
                  'fill': '#78807A'
                },
                dangerText: {
                  'font-family': 'Open Sans',
                  'font-size': 12,
                  'font-weight': '400',
                  'fill': 'red'
                },
                grouNameCalque: {
                  fill: '#484D49',
                  cursor: 'hand',
                  'fill-opacity': 0.6
                },
                grouNameText: {
                  'style': 'cursor: pointer;text-shadow:0px 1px 2px rgba(0,0,0,0.50);',
                  'fill': '#4d4d4d',//'#E1E6E2',
                  'font-size': '18px',
                  'font-weight': '700',
                  'font-family': 'Open Sans',
                  'text-anchor': 'middle'
                },
                internLine: {
                    stroke: '#000',
                    cursor: 'hand',
                    fill: '#000',
                    'fill-opacity': 1,
                    'strokeWidth': 1
                },
                emptyInternLine: {
                    stroke: '#000',
                    cursor: 'hand',
                    fill: '#000',
                    'fill-opacity': 0,
                    'strokeWidth': 0
                },
                rafter: {
                    stroke: '#CCC',
                    fill: '#CCC',
                    'stroke-dasharray': 5
                },
                bridge: {
                    stroke: 'orange',
                    fill: 'orange'
                },
                mount: {
                    stroke: 'red',
                    fill: 'red'
                },
                trim: {
                    stroke: 'none',
                    fill: 'black'
                }
            };
            var Panel = function(canvas) {
                var that = this;
                var _data = this.data = null;
                /**************************************************************/
                var _group = this.panelSvg = canvas.g();
                var _outerBoxes = canvas.g();
                var _mainBoxes = canvas.g();
                var _groupName = canvas.g();
                var _dimensionLines = canvas.g();
                var _bridges = canvas.g();
                var _mounts = canvas.g();
                var _trims = canvas.g();
                var list = [];
                /**************************************************************/
                var _isSelected = false;
                var _isMoved = false;

                
                var _bbox, _outerFrame;
                var _rafter = canvas.g();
                var _rafterHeight = 300;
                

                // projectFx.info.modules.scale = 1px

                var scale = projectFx.info.modules.scale * 1;
                var _rafterSpacing = projectFx.info.rafter.rafter_spacing / scale;
                var _cellWidth = projectFx.info.modules.dimensions_json.width / scale;
                var _cellHeight = projectFx.info.modules.dimensions_json.length / scale ;

                var x_rafter = 0 / scale;
                var y_rafter = 0 / scale;

                var _cellMargin = projectFx.info.modules.cells_spacing / scale;
                /******************************************************************/
                /***************************************************** utility function **************************************************************/
                var _addEventHandlers = function() {
                    _mainBoxes.click(_onMainBoxesClick);
                    canvas.click(_onCanvasClick);
                    _outerBoxes.click(_onOuterBoxClick);
                    _groupName.click(_groupNameClick);
                };

                var _removeEventHandlers = function() {
                    _mainBoxes.unclick(_onMainBoxesClick);
                    canvas.unclick(_onCanvasClick);
                    _outerBoxes.unclick(_onOuterBoxClick);
                    _groupName.unclick(_groupNameClick);
                };

                var _init = function() {
                    _group.add(_rafter);
                    _group.add(_dimensionLines);
                    _group.add(_outerBoxes);
                    _group.add(_mainBoxes);
                    _group.add(_mounts);
                    _group.add(_trims);
                    _group.add(_bridges);
                    _group.add(_groupName);
                    _addDragEvent();
                    _mainBoxes.addClass('unselected');
                };

                // function to  adjust the pos of the array if top row or left column removed
                var _adjust = function(pos) {
                    var coordinates = _group.matrix,
                    adjust = {
                        top: pos[0] === 'top' || pos.length > 1  ? 1 : 0,
                        left: pos[0] === 'left' || pos.length > 1 ? 1 : 0
                    };

                    coordinates.e = coordinates.e + ((that.getCellWidth() + _cellMargin ) * adjust.left);
                    coordinates.f = coordinates.f + ((that.getCellHeight() + _cellMargin ) * adjust.top );
                    _group.transform(coordinates);
                    that.save();
                };
                var _drawCantilever = function(_x, _y , orientation, top , value, red){
                        var x, y, x1, y1 , text;
                        if (that.list.findIndex(function(i){
                            return i.x === Math.floor(_x) && i.y ===  Math.floor(_y);
                        }) > -1) return ;
                        that.list.push({x: Math.floor(_x), y: Math.floor(_y)});
                        text = value.toPrecision(2);
                        x = _x ;
                        y = _y ;
                        x1 = x + (20 * orientation);
                        y1 = y + ((Math.random() * (30 - 5) + 5) * top);
                        _dimensionLines.line(x , y, x1 , y1).attr({stroke: red ? 'red': '#000', fill: 'none', 'strokeWidth': 1});
                        _dimensionLines.line(x1  , y1 , x + (65 * orientation) , y1).attr({stroke: red ? 'red': '#000', fill: 'none', 'strokeWidth': 1});
                        _dimensionLines.text(x + ((orientation == -1 ? 150 : 70) * orientation), y1, text + '" Cantilever').attr( red ? _fillCss.dangerText : _fillCss.dimensionText);
                };
                /*********************************************** draw function ***********************************/
                var _drawCantilevers = function(box){
                    var  cells, sw_val, se_val , nw_val , ne_val , _x , _y;
                    cells = _data.cells;
                    var bbox = _mainBoxes.getBBox();
                    that.list = [];
                    for(var i in cells){
                        nw_val = cells[i].nw_value;
                        ne_val = cells[i].ne_value;
                        sw_val = cells[i].sw_value;
                        se_val = cells[i].se_value;
                        _x = x_rafter + (cells[i].x * (that.getCellWidth() + _cellMargin));
                        _y = y_rafter + (cells[i].y * (that.getCellHeight() + _cellMargin));
                        if (typeof nw_val == 'number') _drawCantilever(_x + 5, _y, -1 , -1 , nw_val, cells[i].danger);
                        if (typeof ne_val == 'number') _drawCantilever(_x + that.getCellWidth() - 5, _y, 1 , -1 , ne_val, cells[i].danger);
                        if (typeof sw_val == 'number') _drawCantilever(_x + 5, _y + that.getCellHeight(), -1 , 1 , sw_val, cells[i].danger);
                        if (typeof se_val == 'number') _drawCantilever(_x + that.getCellWidth() - 5, _y + that.getCellHeight(), 1 , 1 , se_val, cells[i].danger);
                    }
                };
                var _drawBridges = function(){
                    _bridges.clear();
                    if(_isSelected) return ;
                    var x, y, bridges = _data.bridges;
                    for(var i in bridges){
                        x = bridges[i].x / scale;
                        y = bridges[i].y / scale;
                            // _g = _mainBoxes.g().attr({ active : cells[index].active, xIndex : x,yIndex : y});
                            // _g.rect(_x, _y, that.getCellWidth(), that.getCellHeight()).attr({fill: 'url(#zone1)', 'fill-opacity': (cells[index].active ? 1 : (_isSelected ? 0.2 : 0)), stroke: (cells[index].active ? '#4383CC' : 'none')});
                       _bridges.rect( x, y , 12 , 5).attr(_fillCss.bridge); 
                    }
                };
                var _drawMounts = function(){
                    _mounts.clear();
                    if(_isSelected) return ;
                    var x, y, mounts = _data.mounts;
                    for(var i in mounts){
                        x = mounts[i].x / scale;
                        y = mounts[i].y / scale;
                            // _g = _mainBoxes.g().attr({ active : cells[index].active, xIndex : x,yIndex : y});
                            // _g.rect(_x, _y, that.getCellWidth(), that.getCellHeight()).attr({fill: 'url(#zone1)', 'fill-opacity': (cells[index].active ? 1 : (_isSelected ? 0.2 : 0)), stroke: (cells[index].active ? '#4383CC' : 'none')});
                        if (mounts[i].swing_east){
                            _mounts.use(Snap.select('#mountL')).attr({x: x - 3, y: y - 3});
                            break;
                        } 
                       if (mounts[i].swing_west){
                         _mounts.use(Snap.select('#mountR')).attr({x: x - 3, y: y - 3});
                         break;
                        } 
                       _mounts.circle( x, y , 3).attr(_fillCss.mount); 
                    }
                };
                var _drawTrims = function(){
                    _trims.clear();
                    if(_isSelected) return ;
                    var w, x, y, trims = _data.trims;
                    for(var i in trims){
                        x = trims[i].x / scale;
                        y = trims[i].y / scale;
                        w = trims[i].width / scale;
                            // _g = _mainBoxes.g().attr({ active : cells[index].active, xIndex : x,yIndex : y});
                            // _g.rect(_x, _y, that.getCellWidth(), that.getCellHeight()).attr({fill: 'url(#zone1)', 'fill-opacity': (cells[index].active ? 1 : (_isSelected ? 0.2 : 0)), stroke: (cells[index].active ? '#4383CC' : 'none')});
                       _trims.rect( x, y , w , 2).attr(_fillCss.trim); 
                    }
                };
                var _drawRafter = function(){
                    _rafter.clear();
                    var bbox = _mainBoxes.getBBox();
                    for (var x = - _rafterSpacing ; x < bbox.width + _rafterSpacing; x+= _rafterSpacing) {
                        _rafter.line(bbox.x - x_rafter  + x  , bbox.y - (_rafterSpacing + x_rafter) , bbox.x - x_rafter + x , bbox.y + bbox.height + (_rafterSpacing + x_rafter)).attr(_fillCss.rafter);
                    }
                };
                var _drawMainPanel = function() {
                    _mainBoxes.clear();
                    var _x, _y, _g,
                    rows = _data.rows,
                    cols = _data.columns,
                    cells = _data.cells,
                    index = -1;
                    for (var y = 0; y < rows; y++) {
                        for (var x = 0; x < cols; x++) {
                            index++;
                            _x = x_rafter + (x * (that.getCellWidth() + _cellMargin));
                            _y = y_rafter + (y * (that.getCellHeight() + _cellMargin));
                            _g = _mainBoxes.g().attr({ active : cells[index].active, xIndex : x,yIndex : y});
                            _g.rect(_x, _y, that.getCellWidth(), that.getCellHeight()).attr({class: $rootScope.roof_zone_paiting ? 'zone' + $rootScope.zone_type + '_cursor' : '', fill: 'url(#zone'+ (cells[index].zone_type || 1 ) + (cells[index].danger ? '-r' : '') + ')' ,'fill-opacity': (cells[index].active ? 1 : (_isSelected ? 0.2 : 0)), stroke: (cells[index].active ? '#4383CC' : 'none')});
                        }
                    }
                    
                    _drawRafter();
                    _drawMounts();
                    _drawBridges();
                    _drawTrims();
                };

                var _drawGroupName = function() {
                    _groupName.clear();
                    var rectX, rectY, rectSize,
                    bbox = _mainBoxes.getBBox();

                    if (bbox.width && bbox.height) {
                      if(!_data.portrait){
                        rectX = bbox.cx - that.getCellHeight();
                        rectY = bbox.cy - that.getCellHeight() + 2;
                        rectSize = that.getCellHeight()*2;
                      }
                      else{
                        rectX = bbox.cx - that.getCellWidth();
                        rectY = bbox.cy - that.getCellWidth()  + 2;
                        rectSize = that.getCellWidth()*2;
                      }

                      // _groupName.rect(rectX, rectY, rectSize, rectSize, rectSize, rectSize).attr(_fillCss.grouNameCalque);
                      _groupName.text(bbox.cx , bbox.cy + 8, that.data.name || '').attr(_fillCss.grouNameText);
                    }
                };

                var _calculTextLength = function(text){
                  var charSpaceLength = 6,
                  quotePointLength = 4.5,
                  quoteNumber = text.match(/'/gi) ? text.match(/'/gi).length : 0,
                  doubleQuoteNumber = text.match(/"/gi) ? text.match(/"/gi).length : 0,
                  pointNumber = text.match(/\./gi) ? text.match(/\./gi).length : 0,
                  spaceNumber = text.match(/ /gi) ? text.match(/ /gi).length : 0,
                  charNumber = text.match(/[0-9]/gi) ? text.match(/[0-9]/gi).length : 0;

                  return (2 + (quoteNumber + doubleQuoteNumber + pointNumber) * quotePointLength + (spaceNumber + charNumber) * charSpaceLength);
                };

                var _drawDimensionLine = function() {
                    _dimensionLines.clear();
                    if (!_isSelected && that.data.ew_size && that.data.ns_size) {
                        var bbox = _mainBoxes.getBBox(),
                        verticalText = new Snap.Matrix(),
                        ewText = that.data.ew_size.feet + '\' ' + Math.round(that.data.ew_size.inches) + '"',
                        nsText = that.data.ns_size.feet + '\' ' + Math.round(that.data.ns_size.inches) + '"';
                        var ewTextLength = _calculTextLength(ewText),
                        nsTextLength = _calculTextLength(nsText);
                        //Horizontal
                        var arrow1 = _dimensionLines.polygon([0, 20, 8, 20, 4, 0, 0, 20]).attr({ fill: '#323232' }).transform('r90');
                        var arrow2 = _dimensionLines.polygon([0, 20, 8, 20, 4, 0, 0, 20]).attr({ fill: '#323232' }).transform('r-90');
                        var marker1 = arrow1.marker(0, 0, 10, 20, 10, 10);
                        var marker2 = arrow2.marker(0, 0, 10, 20, 0, 10);
                        var style = { markerStart : marker2, markerEnd : marker1, stroke: '#000', fill: 'none', cursor: 'hand','fill-opacity': 1, 'strokeWidth': 1};
                        _dimensionLines.line(bbox.x, bbox.y - 40, bbox.x + bbox.w, bbox.y - 40).attr(style);
                        // limit of h line
                        _dimensionLines.line(bbox.x, bbox.y - 60, bbox.x, bbox.y - 20).attr({stroke: '#000', fill: 'none', 'strokeWidth': 1});
                         _dimensionLines.line(bbox.x + bbox.w, bbox.y - 60, bbox.x + bbox.w, bbox.y - 20).attr({stroke: '#000', fill: 'none', 'strokeWidth': 1});
                        /////////
                        _dimensionLines.rect(bbox.x + bbox.w / 2 - ewTextLength / 2, bbox.y - 50, ewTextLength , 20).attr({fill: '#FFF'});
                        _dimensionLines.text(bbox.x + bbox.w / 2 - (ewTextLength / 2 - 2), bbox.y - 37, ewText).attr(_fillCss.dimensionText);
                        // Vertical
                        _dimensionLines.line(bbox.x - 40, bbox.y, bbox.x - 40, bbox.y + bbox.h).attr(style);
                        // limit of v line
                        _dimensionLines.line(bbox.x - 60, bbox.y, bbox.x - 20, bbox.y).attr({stroke: '#000', fill: 'none', 'strokeWidth': 1});
                         _dimensionLines.line(bbox.x - 60, bbox.y + bbox.h, bbox.x - 20 , bbox.y + bbox.h).attr({stroke: '#000', fill: 'none', 'strokeWidth': 1});
                        /////////
                        _dimensionLines.rect( bbox.x - 50, bbox.y + bbox.h / 2 - nsTextLength/2, 20, nsTextLength ).attr({fill: '#FFF'});
                        verticalText.rotate(-90);
                        _dimensionLines.text(-bbox.y - bbox.h / 2 - (nsTextLength / 2 - 2), bbox.x - 34, nsText).attr({
                            transform: verticalText,
                            'font-family': 'Open Sans',
                            'font-size': 12,
                            'font-weight': '400',
                            'fill': '#78807A'
                        });

                        _drawCantilevers(_dimensionLines);
                        // cantilever
                        // _dimensionLines.line(bbox.x + bbox.w - 5 , bbox.y - 2, bbox.x + bbox.w + 20 , bbox.y - 20).attr({stroke: '#000', fill: 'none', 'strokeWidth': 1});
                        // _dimensionLines.line(bbox.x + bbox.w + 20  , bbox.y - 20 , bbox.x + bbox.w + 65 , bbox.y - 20).attr({stroke: '#000', fill: 'none', 'strokeWidth': 1});
                        // _dimensionLines.rect( bbox.x + bbox.w + 30, bbox.y - 30 , 40, 20).attr({fill: '#FFF'});
                        
                    }
                };
                var _drawOuterBoxes = function() {
                    _outerBoxes.clear();
                    var _x, _y, rect,
                    rows = _data.rows,
                    cols = _data.columns,
                    bbox = _mainBoxes.getBBox(),
                    background_outerFrame = canvas.rect(bbox.x - that.getCellWidth() - 3, bbox.y - that.getCellHeight() - 3, bbox.width + (2 * that.getCellWidth()) + 6, bbox.height + (2 * that.getCellHeight()) + 6, 3);
                    background_outerFrame.attr(_fillCss.outerFrameBackGround);

                    _outerBoxes.add(background_outerFrame);
                    _outerFrame = canvas.rect(bbox.x - that.getCellWidth() - 3, bbox.y - that.getCellHeight() - 3, bbox.width + (2 * that.getCellWidth()) + 5, bbox.height + (2 * that.getCellHeight()) + 5, 3);
                    _outerFrame.id = 'outerFrame';
                    _outerFrame.attr(_fillCss.outerFrame);
                    _outerBoxes.add(_outerFrame); //is this needed?
                    //Draw surrounding transparent boxes
                    for (var y = -1; y < rows + 1; y++) {
                        for (var x = -1; x < cols + 1; x++) {
                            _x = (x * (that.getCellWidth() + _cellMargin)) + (bbox.x +1);
                            _y = (y * (that.getCellHeight() + _cellMargin)) + bbox.y;

                            if (y === -1 || y === rows || x === -1 || x === cols) {
                                rect = canvas.rect(_x, _y, that.getCellWidth(), that.getCellHeight());
                                rect.xIndex = x ;
                                rect.yIndex = y;
                                rect.attr(_fillCss.emptyBox);
                                _outerBoxes.add(rect);
                            }
                        }
                    }
                    //_outerFrame.attr({ filter: null });
                };

                var _addElementToPanel = function(xIndex, yIndex) {
                    _outerBoxes.clear();
                    $rootScope.isSaved = false;
                    //_clearDimensionLine();
                    var ob, i, objIndex,
                    coordinates = _mainBoxes.getBBox(),
                    cols = _data.columns,
                    rows = _data.rows,
                    bordersTobeFilled = [
                        (yIndex === -1) ? 1 : 0, //top
                        (xIndex === cols) ? 1 : 0, //right
                        (yIndex === rows) ? 1 : 0, //bottom
                        (xIndex === -1) ? 1 : 0 //left
                    ];
                    // this should add element to top
                    // so we need to to reposition it

                    if (!_data.cells.push) _data.cells = lodash.values(_data.cells);
                       

                    for (i = 0; i < _data.cells.length; i++) {
                        _data.cells[i].y += bordersTobeFilled[0];
                        _data.cells[i].x += bordersTobeFilled[3];
                    }

                    _data.rows += (bordersTobeFilled[0] + bordersTobeFilled[2]);
                    _data.columns += (bordersTobeFilled[1] + bordersTobeFilled[3]);
                    if (bordersTobeFilled[2] + bordersTobeFilled[0] > 0) {//Added an element in the bottom or top row
                        for (i = 0; i < _data.columns; i++) {
                            if (xIndex === -1 && (bordersTobeFilled[3] + bordersTobeFilled[1] > 0)) xIndex = 0;

                            ob = {
                                'x': i,
                                'y': (_data.rows - 1) * bordersTobeFilled[2],
                                'active': i === xIndex
                            };

                            _data.cells.push(ob);
                        }
                    }

                    if (bordersTobeFilled[3] + bordersTobeFilled[1] > 0){ //added an element in the left or right column
                        for (i = bordersTobeFilled[0]; i < _data.rows - bordersTobeFilled[2]; i++) {
                            ob = {
                                'x': bordersTobeFilled[1] * (_data.columns - 1),
                                'y': i,
                                'active': (i === yIndex)
                            };

                            _data.cells.push(ob);
                        }
                    }

                    coordinates = _group.matrix;
                    coordinates.e = coordinates.e - ((that.getCellWidth() + _cellMargin  ) * bordersTobeFilled[3]);
                    coordinates.f =  coordinates.f - ((that.getCellHeight() + _cellMargin ) * bordersTobeFilled[0]);
                    _group.transform(coordinates);
                    that.save();
                    _data.cells = lodash.sortByAll(_data.cells, ['.y', 'x']);
                    that.data = _data;
                    that.update();


                    objIndex = lodash.findIndex(projectFx.info.arrays.objects, function(o) {
                        return o._id == _data._id;
                    });

                    if (objIndex > -1)  projectFx.info.arrays.objects[objIndex] = _data;
                };


                this.orient = function() {
                    _data.portrait = !_data.portrait;
                    that.data.portrait = _data.portrait;
                    that.update();
                    _group.transform('t' + _getLimit(_data._id));
                    $rootScope.isSaved = false;
                };

                this.getCellWidth = function() {
                    return _data.portrait ? _cellWidth : _cellHeight;
                };

                this.getCellHeight = function() {
                    return _data.portrait ? _cellHeight : _cellWidth;
                };

                this.save = function() {
                    var parent,
                    bbox = _group.matrix;

                    if (!$localStorage.ironridge) $localStorage.ironridge = {};
                    if (!$localStorage.ironridge[projectFx.info.id]) $localStorage.ironridge[projectFx.info.id] = {};
                    if($localStorage.ironridge[projectFx.info.id][that.data._id]) parent = $localStorage.ironridge[projectFx.info.id][that.data._id].parent;

                    $localStorage.ironridge[projectFx.info.id][that.data._id] = {
                                                                                  x: bbox.e || 0,
                                                                                  y: bbox.f || 0,
                                                                                  parent : parent
                                                                              };
                };

                this.move = function(x, y) {
                    var t = new Snap.Matrix();
                    t.translate(x, y);
                    _group.transform(t);
                    that.save();
                };

                // function to update svg this panel after any data change (redraw)
                this.update = function() {
                    _data = that.data;
                    scale = projectFx.info.modules.scale * 1;
                    _rafterSpacing = projectFx.info.rafter.rafter_spacing / scale;
                    _cellWidth = projectFx.info.modules.dimensions_json.width / scale;
                    _cellHeight = projectFx.info.modules.dimensions_json.length / scale ;

                    x_rafter = _data.x  / scale;
                    y_rafter = _data.y / scale;
                    //_adjust();
                    _drawMainPanel();
                    _drawGroupName();
                    if ($rootScope.showDimension) _drawDimensionLine();
                    //else _dimensionLines.clear();
                    _drawOuterBoxes();
                };

                this.showDimension = function() {
                    if ($rootScope.showDimension && !_isSelected) _drawDimensionLine();
                    else _dimensionLines.clear();
                };

                this.destroy = function() {
                    var index = lodash.findIndex(projectFx.info.arrays.objects, function(o) {
                        return o ? o._id == _data._id : false;
                    });

                    _removeEventHandlers();
                    _group.clear();
                    _group.remove();
                    projectFx.info.arrays.objects[index] = undefined;
                };

                // function to draw panel in first time like ( constrector )
                this.draw = function(obj, id) {
                    that.data = _data = obj;
                    that.id = id;
                    _init();
                    _group.attr({'id' : that.data._id, 'class': 'panel-item'});
                    _addEventHandlers();
                    _outerBoxes.attr({  'visibility': 'hidden' });
                    if(that.data.name) that.update();// update view if the element as loaded from server
                };

                /*********************************************** select / unselect function *********************************/
                this.unselect = function() {
                    if (!_isSelected) return;

                    _isSelected = false;
                    $rootScope.selectedPanels.splice($rootScope.selectedPanels.indexOf(that.id), 1);

                    if(!$rootScope.selectedPanels.length) $rootScope.disableDeleteOrientBtn();
                    // if (!$rootScope.isSaved && !$rootScope.StopUpdateInOutClick) {
                    //     projectFx.updateArrays();
                    // } else {
                    //     $rootScope.StopUpdateInOutClick = false;
                    //     console.log('no need to resave');
                    // }
                    _outerFrame.attr({ filter: false });

                    _outerBoxes.animate(_fillCss.transparent, 1, mina.easein, function() {
                        _outerBoxes.attr({ 'visibility': 'hidden' });
                    });
                    //var _fill =  !r.active  ? _fillCss.emptyMainBox : (_isSelected ? _fillCss.activeElement : _fillCss.unactiveElement) ;
                    _mainBoxes.removeClass('selected');
                    _mainBoxes.addClass('unselected');
                    _groupName.attr({ 'visibility': 'visible' });

                    _drawMainPanel();
                    that.showDimension();
                    canvas.drag();
                    $rootScope.customCanvasDrag();
                    $rootScope.reposiCanvas();
                };

                this.selectEffect = function(group) {
                  //if(!$rootScope.StopUpdateInOutClick){
                    $rootScope.enableDeleteOrientBtn();
                    _isSelected = true;

                    if (!group) {
                        $rootScope.$emit('panel:selected', that.data._id);
                        $rootScope.selectedPanels = [that.id];
                    } else {
                        $rootScope.selectedPanels.push(that.id);
                    }

                    _outerBoxes.attr({ 'visibility': 'visible' });
                    _outerBoxes.animate({ 'stroke-opacity': 1}, 500, mina.easein);
                    _groupName.attr({ 'visibility': 'hidden' });
                    //_clearGroupName();
                    _mainBoxes.removeClass('unselected');
                    _mainBoxes.addClass('selected');
                    _drawMainPanel();
                    that.showDimension();
                    canvas.undrag();
                    angular.element('.array-panel').focus();
                  //}
                };
                /***************************************************** event handles *****************************************/
                var _groupNameClick = function(event) {
                    event.stopPropagation();

                    if (_isMoved) {
                        _isMoved = false;
                        return;
                    }

                    that.selectEffect(event.shiftKey);
                };

                var _onOuterBoxClick = function(event) {
                    if (_isMoved) {
                        return;
                    }

                    event.stopPropagation();
                    var element = Snap.getElementByPoint(event.clientX, event.clientY);

                    if (element.id === 'outerFrame') return;

                    _addElementToPanel(element.xIndex, element.yIndex);
                };

                var _onCanvasClick = function(event) {
                    //var element = Snap.getElementByPoint(event.clientX, event.clientY);
                    if (event.target.className && event.target.className.baseVal.indexOf('mainCanvas') == -1) return;

                    _isMoved = false;
                    //event.stopPropagation();
                    $rootScope.$emit('panel:selected');
                    $rootScope.selectedPanels = [];
                };

                var _onMainBoxesClick = function(event) {
                    event.stopPropagation();
                    _bbox = _group.getBBox();

                    if (!_isSelected && _isMoved) {
                        _isMoved = false;
                        return;
                    }

                    if (_isSelected && !_isMoved) {
                        _group.undrag();
                        $rootScope.isSaved = false;
                        var i, j, index, currentYIndex, toRemoveRow, currentXIndex, toRemoveCol,
                        element = Snap.getElementByPoint(event.clientX, event.clientY),
                        isActive = element.node.parentNode.attributes.active.value === 'true' ? true : false,
                        xIndex = Number(element.node.parentNode.attributes.xIndex.value),
                        yIndex = Number(element.node.parentNode.attributes.yIndex.value),
                        ajust = [];

                        
                        _data.cells = lodash.values(_data.cells);
                        index = xIndex + (yIndex * _data.columns);

                        if ($rootScope.roof_zone_paiting) {
                          _data.cells[index].zone_type = $rootScope.zone_type;
                          that.update();
                          return;  
                        }

                        _data.cells[index].active = !isActive;
                        element.node.parentNode.attributes.active.value = !isActive;
                        if ((_data.columns * _data.rows) === 1) return;

                        /***************************** row ************************************/
                        //check if selected row need to be removed or if rows above need to be removed
                        currentYIndex = yIndex;
                        var fn = function(n, index) {
                                    return index >= (currentYIndex * _data.columns) && index < ((currentYIndex * _data.columns) + _data.columns);
                                  };
                        do{
                              toRemoveRow = true;

                              for (j = 0; j < _data.columns; j++) {
                                  if (_data.cells[(currentYIndex * _data.columns) + j].active) {
                                      toRemoveRow = false;
                                      break;
                                  }
                              }

                              if(toRemoveRow && currentYIndex !== 0 && currentYIndex !== _data.rows - 1) toRemoveRow = false;

                              if (toRemoveRow) {
                                  lodash.remove(_data.cells, fn);
                                  _data.rows--;
                                  if (currentYIndex < _data.rows / 2) ajust.push('top');
                              }

                              currentYIndex--;
                        }  while(toRemoveRow && currentYIndex >= 0 && !_data.cells[currentYIndex * _data.columns].active);

                        //check if rows below selected row need to be removed
                        if(yIndex === 0){
                              toRemoveRow = true;
                              var fn2 = function(n, index) {
                                              return index >= 0 && index < _data.columns;
                                            };
                              while(toRemoveRow && _data.rows  > 0 && !_data.cells[ _data.columns-1].active)
                              {
                                  for (j = 0; j < _data.columns; j++) {
                                      if (_data.cells[j].active) {
                                          toRemoveRow = false;
                                          break;
                                      }
                                  }

                                  if (toRemoveRow) {
                                      lodash.remove(_data.cells, fn2);
                                      _data.rows--;
                                      ajust.push('top');
                                  }
                              }
                        }
                        /***************************** col ************************************/
                        //check if selected column need to be removed or if columns right need to be removed
                        currentXIndex = xIndex;
                        var fn3 = function(n, index) {
                                            return ((index - currentXIndex) % _data.columns) === 0;
                                        };
                        do {
                              toRemoveCol = true;

                              for (j = 0; j < _data.rows; j++) {
                                  if (_data.cells[currentXIndex + (j * _data.columns)].active) {
                                      toRemoveCol = false;
                                      break;
                                  }
                              }

                              if(toRemoveCol && currentXIndex !== 0 && currentXIndex !== _data.columns - 1) toRemoveCol = false;

                              if (toRemoveCol) {
                                  lodash.remove(_data.cells, fn3);
                                  _data.columns--;

                                  if (currentXIndex < _data.columns) ajust.push('left');
                              }

                              currentXIndex--;
                        } while(toRemoveCol && currentXIndex >= 0 && !_data.cells[currentXIndex].active);

                        //check if columns below selected row need to be removed
                        if(xIndex === 0){
                              toRemoveCol = true;
                              var fn4 = function(n, index) {
                                                return ((index ) % _data.columns) === 0;
                                            };
                              while(toRemoveCol && _data.columns > 0 && !_data.cells[0].active)
                              {
                                  for (j = 0; j < _data.rows; j++) {
                                      if (_data.cells[ (j * _data.columns)].active) {
                                          toRemoveCol = false;
                                          break;
                                      }
                                  }

                                  if (toRemoveCol) {
                                      //_clearDimensionLine();
                                      lodash.remove(_data.cells, fn4);
                                      _data.columns--;
                                      ajust.push('left');
                                  }
                              }
                        }
                        /**********************************************************************/
                        for (i = 0; i < _data.columns; i++) {
                              for (j = 0; j < _data.rows; j++) {
                                  _data.cells[(j * _data.columns) + i].x = i;
                                  _data.cells[(j * _data.columns) + i].y = j;
                              }
                        }

                        that.update();

                        if(ajust.length > 0) _adjust(ajust);

                        that.data = _data;
                        var objIndex = lodash.findIndex(projectFx.info.arrays.objects, function(o) {
                                                  return o._id == _data._id;
                                              });

                        if (objIndex > -1) projectFx.info.arrays.objects[objIndex] = _data;

                        _addDragEvent();
                    } else if (!_isSelected) {
                        if (_isMoved) {
                            _isMoved = false;
                            return;
                        }

                        _isSelected = true;
                        that.selectEffect();
                    }
                };

                var _getLimit = function(id){
                  var localId = id,
                  objIndex = lodash.findIndex(projectFx.info.arrays.objects, function(item) {
                                            return item._id == localId;
                                        }),
                  localObj = projectFx.info.arrays.objects[objIndex],
                  widthPanel = (localObj.columns + 1) * ((localObj.portrait ? _cellWidth : _cellHeight)+1),
                  heightPanel = (localObj.rows + 1) * ((localObj.portrait ? _cellHeight : _cellWidth)+1),
                  limitXMin = -($rootScope._canvasWidth * 2 - ((localObj.portrait ? _cellWidth : _cellHeight)+5)),
                  limitXMax = $rootScope._canvasWidth * 3  - (widthPanel),
                  limitYMin = -($rootScope._canvasHeight * 2 - ((localObj.portrait ? _cellHeight : _cellWidth)+5)),
                  limitYMax = $rootScope._canvasHeight * 3  - (heightPanel),
                  total = _group.transform().local.substring(1);
                  total = total.split(',');

                  if(total[0] < limitXMin)
                    total[0] = limitXMin;
                  else if(total[0] > limitXMax)
                    total[0] = limitXMax;

                  if(total[1] < limitYMin)
                    total[1] = limitYMin;
                  else if(total[1] > limitYMax)
                    total[1] = limitYMax;

                  return total;
                };

                var _addDragEvent = function() {
                    _group.drag(function(dx, dy) {
                        _isMoved = true;
                        var tdx, tdy,
                        snapInvMatrix = _group.transform().diffMatrix.invert();
                        snapInvMatrix.e = snapInvMatrix.f = 0;
                        tdx = snapInvMatrix.x(dx, dy);
                        tdy = snapInvMatrix.y(dx, dy);
                        _group.transform(_group.data('oldt') + 't' + [tdx, tdy]);
                        _group.transform('t' + _getLimit(this.node.id));
                    }, function() {
                      _isMoved = false;
                        canvas.undrag();
                        _group.data('oldt', _group.transform());
                        $rootScope.$emit('panel:draged');
                    }, function() {
                        $rootScope.customCanvasDrag();
                        that.save();
                        canvas.drag();
                        $rootScope.$emit('panel:draged');
                    });
                };
                /*************************************************************************************************************/
            };

            function PanelObject() {
                this.instance = function(canvas) {
                    return new Panel(canvas);
                };
            }

            return new PanelObject();
        });
})();
