(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.D3CE = global.D3CE || {})));
}(this, (function (exports) { 'use strict';

var Axes = {
    tickMargin: 40,
    list: [{
        name: 'Front',
        indices: ['x', 'y', 'z']
    }, {
        name: 'Right',
        indices: ['z', 'y', 'x']
    }, {
        name: 'Top',
        indices: ['x', 'z', 'y']
    }]
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();


var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var CurvePoint = function () {
    function CurvePoint(x, y, z) {
        classCallCheck(this, CurvePoint);
	
	    //changed
        this.radius = 7;
        this.fixed = false;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    createClass(CurvePoint, [{
        key: 'getDimention',
        value: function getDimention() {
            return typeof this.z === 'undefined' ? 2 : 3;
        }
    }, {
        key: 'isFixed',
        value: function isFixed(val) {
            if (typeof val === 'boolean') {
                this.fixed = val;
                return this;
            }
            return this.fixed;
        }
    }]);
    return CurvePoint;
}();

var EditorView = function () {
    function EditorView(editor, container) {
        var _this = this;

        classCallCheck(this, EditorView);


        this.editor = editor;

        var props = this.editor.properties;
        var range = props.range;

        this.x = d3.scaleLinear().domain(range[this.axis(0)].toArray());
        this.y = d3.scaleLinear().domain(range[this.axis(1)].toArray());

        this.container = d3.select(container).classed('curve-editor', true).attr('tabindex', 1);

        this.rect = this.container.append('rect').attr('fill', 'transparent').on('click', this.rectClick.bind(this));

        this.view = this.container.append('g');

        //changed [0.5, 2.0] to [0.5, 0.5]
        this.zoom = d3.zoom().scaleExtent([0.5, 0.5]).on('zoom', function () {
            _this.view.attr('transform', d3.event.transform);
            _this.gX.call(_this.xAxis.scale(d3.event.transform.rescaleX(_this.x)));
            _this.gY.call(_this.yAxis.scale(d3.event.transform.rescaleY(_this.y)));
        });

        this.container.call(this.zoom);

        this.xAxis = d3.axisBottom(this.x);
        this.yAxis = d3.axisLeft(this.y);

        this.gX = this.container.append('g');
        this.gY = this.container.append('g');

        this.valueline = d3.line().curve(props.curve);

        this.coordSwitcher = this.container.append('text').on('click', function () {

            if (props.dimention === 2) throw new Error('dimention = 2');

            for (var i = 0; i < Axes.list.length; i++) {
                if (props.activeAxes === Axes.list[i]) {
                    props.activeAxes = Axes.list[(i + 1) % Axes.list.length];
                    break;
                }
            }_this.coordSwitcher.text(function () {
                return props.activeAxes.name;
            });

            _this.resize();
        }).text(function () {
            return props.activeAxes.name;
        }).style('display', props.dimention > 2 ? 'block' : 'none').classed('switcher', true);

        d3.select(window).on('keydown.' + this.editor._id, function () {
            _this.container.node() === document.activeElement ? _this.editor.keydown() : null;
        }).on('resize.' + this.editor._id, this.resize.bind(this));

        this.resize();
    }

    createClass(EditorView, [{
        key: 'axis',
        value: function axis(i) {
            return this.editor.properties.activeAxes.indices[i];
        }
    }, {
        key: 'getCoordinate',
        value: function getCoordinate(point, i) {
            return point[this.axis(i)];
        }
    }, {
        key: 'setCoordinate',
        value: function setCoordinate(point, i, val) {
            point[this.axis(i)] = val;
        }
    }, {
        key: 'resize',
        value: function resize() {
            var bbox = this.container.node().getBoundingClientRect();

            var _ref = [bbox.width, bbox.height],
                width = _ref[0],
                height = _ref[1];

            var margin = this.editor.properties.margin;

            var _ref2 = this.editor.properties.stretch ? [width, height] : [Math.max(height, width), Math.max(height, width)],
                _ref3 = slicedToArray(_ref2, 2),
                w = _ref3[0],
                h = _ref3[1];

            this.x.range([0, w]);
            this.y.range([h, 0]);

            this.zoom.translateExtent([[-margin, -margin], [w + margin, h + margin]]);

            this.container.attr('width', width).attr('height', height);

            this.rect.attr('width', width).attr('height', height);

            this.xAxis.ticks(Math.floor(height / Axes.tickMargin));
            this.yAxis.ticks(Math.floor(height / Axes.tickMargin));

            this.gX.attr('transform', 'translate(0,' + (height - margin) + ')').call(this.xAxis);
            this.gY.attr('transform', 'translate(' + margin + ', 0)').call(this.yAxis);

            this.zoom.scaleTo(this.container, 1);

            this.coordSwitcher.attr('x', width - 2 * Axes.tickMargin).attr('y', Axes.tickMargin);

            this.update();
        }
    }, {
        key: 'updatePath',
        value: function updatePath() {
            var _this2 = this;

            var path = this.view.selectAll('path').data(this.editor.lines).attr('d', this.valueline);

            path.exit().remove();

            var newPath = path.enter().append('path').classed('line', true);

            this.valueline.x(function (d) {
                return _this2.x(_this2.getCoordinate(d, 0));
            }).y(function (d) {
                return _this2.y(_this2.getCoordinate(d, 1));
            });

            newPath.merge(path).attr('d', function (d) {
                return _this2.valueline(d.points);
            }).attr('class', function (d) {
                return d === _this2.editor.active.line ? 'line active' : 'line';
            });
        }
    }, {
        key: 'updatePoints',
        value: function updatePoints() {
            var _this3 = this;

            var item = this.view.selectAll('circle').data(this.editor.lines.reduce(function (a, b) {
                return a.concat(b.points);
            }, []));

            item.exit().remove();

            var newItem = item.enter().append('circle');

            newItem.on('click', function (point) {
                return _this3.editor.selectPoint(point);
            }).call(d3.drag().on('start', function (point) {
                return _this3.editor.selectPoint(point);
            }).on('drag', this.onDrag.bind(this)));

            item = newItem.merge(item);

            item.attr('cx', function (d) {
                return _this3.x(_this3.getCoordinate(d, 0));
            }).attr('cy', function (d) {
                return _this3.y(_this3.getCoordinate(d, 1));
            }).attr('r', function (d) {
                return d.radius;
            }).attr('class', function (d) {
                var actClass = _this3.editor.active.point === d ? 'active' : '';
                var fixClass = d.isFixed() ? ' fixed' : '';

                return 'point ' + actClass + '  ' + fixClass;
            });
        }
    }, {
        key: 'onDrag',
        value: function onDrag(d) {
            var position = d3.mouse(this.view.node());

            if (d.isFixed()) return;

            var range = this.editor.properties.range;
            var rangeX = range[this.axis(0)];
            var rangeY = range[this.axis(1)];

            this.setCoordinate(d, 0, rangeX.clamp(this.x.invert(position[0])));
            this.setCoordinate(d, 1, rangeY.clamp(this.y.invert(position[1])));

            this.editor.eventListener.trigger('change', this.editor.active);
            this.update();
        }
    }, {
        key: 'addPoint',
        value: function addPoint() {
            if (!this.editor.active.line) {
                alert('Select the required line for adding points');
                return;
            }

            var props = this.editor.properties;
            var mouse = d3.mouse(this.view.node());
            var point = new CurvePoint();

            this.setCoordinate(point, 0, this.x.invert(mouse[0]));
            this.setCoordinate(point, 1, this.y.invert(mouse[1]));

            var range = props.range;
            var rangeX = range[this.axis(0)];
            var rangeY = range[this.axis(1)];

            if (!rangeX.contains(this.getCoordinate(point, 0)) || !rangeY.contains(this.getCoordinate(point, 1))) {
                alert('Out of range');
                return;
            }

            var line = this.editor.active.line;
            var neighbor = line.getNeighbor(point, [this.axis(0), this.axis(1)], props.closed);

            if (props.dimention === 3) {
                var prev = line.points[neighbor];
                var next = line.points[neighbor + 1];
                var coord = this.getCoordinate(prev, 2) + this.getCoordinate(next, 2) / 2;

                this.setCoordinate(point, 2, coord);
            }

            this.editor.addPoint(point, neighbor + 1);
        }
    }, {
        key: 'update',
        value: function update() {
            this.updatePath();
            this.updatePoints();
        }
    }, {
        key: 'rectClick',
        value: function rectClick() {
            if (this.editor.properties.fixedCount === false) this.addPoint();
        }
    }]);
    return EditorView;
}();

var EventListener = function () {
    function EventListener() {
        classCallCheck(this, EventListener);

        this.events = {
            add: [],
            remove: [],
            change: []
        };
    }

    createClass(EventListener, [{
        key: 'on',
        value: function on(names, handler) {
            var _this = this;

            names.split(' ').forEach(function (name) {
                if (!_this.events[name]) throw new Error('The event ' + name + ' does not exist');
                _this.events[name].push(handler);
            });

            return this;
        }
    }, {
        key: 'trigger',
        value: function trigger(name, param) {
            var _this2 = this;

            if (!(name in this.events)) throw new Error('The event ' + name + ' cannot be triggered');

            return this.events[name].reduce(function (r, e) {
                return e(param, _this2.persistent) !== false && r;
            }, true); // return false if at least one event is false        
        }
    }]);
    return EventListener;
}();

var Range = function () {
    function Range(a, b) {
        classCallCheck(this, Range);

        this.a = a;
        this.b = b;
    }

    createClass(Range, [{
        key: "clamp",
        value: function clamp(value) {
            return Math.max(this.a, Math.min(this.b, value));
        }
    }, {
        key: "contains",
        value: function contains(value) {
            return this.a <= value && value <= this.b;
        }
    }, {
        key: "toArray",
        value: function toArray$$1() {
            return [this.a, this.b];
        }
    }]);
    return Range;
}();

var CurveEditor = function () {
    function CurveEditor(container, lines) {
        var properties = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        classCallCheck(this, CurveEditor);


        this._id = Math.random().toString(36).substr(2, 9);
        this.properties = Object.assign({
            dimention: lines[0].points[0].getDimention(),
            activeAxes: Axes.list[0],
            fixedCount: false,
            fixedAxis: null,
            stretch: false,
            curve: d3.curveBasis,
            closed: properties.curve === d3.curveBasisClosed || properties.curve === d3.curveCardinalClosed || properties.curve === d3.curveCatmullRomClosed || properties.curve === d3.curveLinearClosed,
            margin: 25,
            range: {
                x: new Range(0, 1),
                y: new Range(0, 1),
                z: new Range(0, 1)
            }
        }, properties);
        this.lines = lines;
        this.eventListener = new EventListener();

        this.active = {
            line: null,
            point: null
        };

        this.view = new EditorView(this, container);
    }

    createClass(CurveEditor, [{
        key: 'selectLine',
        value: function selectLine(line) {
            if (this.lines.indexOf(line) === -1) throw new Error('Line not found in this editor');

            this.active.line = line;
            this.view.update();
        }
    }, {
        key: 'selectPoint',
        value: function selectPoint(point) {
            this.active.line = this.lines.find(function (line) {
                return line.points.indexOf(point) !== -1;
            });

            this.active.point = point;
            this.view.update();
        }
    }, {
        key: 'addPoint',
        value: function addPoint(point, position) {
            if (!this.active.line) throw new Error('Need an active line');
            //changed
            this.active.point = point;

            this.active.line.insert(position, point);
            this.eventListener.trigger('add', this.active.line, point);
            this.view.update();
        }
    }, {
        key: 'removePoint',
        value: function removePoint(point) {
            //changed
            this.removedPointPosition = this.active.line.points.indexOf(point);

            var activeLine = this.lines.find(function (line) {
                return line.points.indexOf(point) !== -1;
            });

            if (!activeLine) throw new Error('Point not found in any line');

            activeLine.remove(point);
            this.active.point = null;
            this.eventListener.trigger('remove', activeLine, point);
            this.view.update();
        }
    }, {
        key: 'removeLine',
        value: function removeLine(line) {
            var index = this.lines.indexOf(line);

            if (index === -1) console.warn('this line was not found in the editor');else this.lines.splice(index, 1);

            this.eventListener.trigger('change');
            this.view.update();
        }
    }, {
        key: 'keydown',
        value: function keydown() {
            switch (d3.event.keyCode) {
                case 46:
                    try {
                        if (this.active.point !== null) this.removePoint(this.active.point);
                    } catch (e) {
                        alert(e.message);
                        console.warn(e);
                    }
                    break;
            }
        }
    }]);
    return CurveEditor;
}();

var Line = function () {
    function Line(color, points, max, name) {
        classCallCheck(this, Line);

        this.color = color;
        this.points = points;
        this.max = max;
        //changed
        this.name = name;

        if (points.length < 2) throw new Error('Need more points');

        if (!this.validDimention()) throw new Error('Not all the points of the same dimension');
    }

    createClass(Line, [{
        key: 'validDimention',
        value: function validDimention() {
            var _this = this;

            return this.points.every(function (point) {
                return point.getDimention() === _this.points[0].getDimention();
            });
        }
    }, {
        key: 'insert',
        value: function insert(i, point) {
            if (!(point instanceof CurvePoint)) throw new Error('Invalid instance');
            if (this.points.length >= this.max) throw new Error('Max points');
            this.points.splice(i, 0, point);
        }
    }, {
        key: 'remove',
        value: function remove(point) {

            if (this.points.length <= 2) throw new Error('You cannot remove the remaining 2 points');

            if (point.isFixed()) throw new Error('This point is fixed');

            var index = this.points.indexOf(point);

            this.points.splice(index, 1);

            return this.points[Math.max(index - 1, 0)];
        }
    }, {
        key: 'getNeighbor',
        value: function getNeighbor(point, axis, closed) {

            var minDistance = null;
            var index = -1;
            var count = this.points.length;

            var l = count - 1;

            if (closed) l = count;

            for (var i = 0; i < l; i++) {

                var p1 = this.points[i];
                var p2 = this.points[i + 1 === count ? 0 : i + 1];

                var segDistance = this.distToSegment(point, p1, p2, axis);

                if (minDistance === null || minDistance > segDistance) {
                    minDistance = segDistance;
                    index = i;
                }
            }

            return index;
        }
    }, {
        key: 'distToSegment',
        value: function distToSegment(p, v, w, axis) {

            p = {
                x: p[axis[0]],
                y: p[axis[1]]
            };
            v = {
                x: v[axis[0]],
                y: v[axis[1]]
            };
            w = {
                x: w[axis[0]],
                y: w[axis[1]]
            };

            function dist2(q, e) {
                return Math.pow(q.x - e.x, 2) + Math.pow(q.y - e.y, 2);
            }

            var l2 = dist2(v, w);

            if (l2 === 0) return dist2(p, v);
            var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

            t = Math.max(0, Math.min(1, t));
            return Math.sqrt(dist2(p, {
                x: v.x + t * (w.x - v.x),
                y: v.y + t * (w.y - v.y)
            }));
        }
    }]);
    return Line;
}();

exports.Axes = Axes;
exports.CurvePoint = CurvePoint;
exports.CurveEditor = CurveEditor;
exports.Line = Line;
exports.Range = Range;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=d3-curve-editor.js.map

