import React, { Component, PropTypes } from 'react';
import { VirtualScroll } from 'react-virtualized';
import classNames from 'classnames';
import moment from 'moment';
import { getMonth, getWeeksInMonth, validParsedDate } from '../utils';
import Month from '../Month';

var style = {
	'root': 'Cal__List__root',
	'scrolling': 'Cal__List__scrolling'
};

var List = function (_Component) {
	babelHelpers.inherits(List, _Component);

	function List() {
		var _Object$getPrototypeO;

		var _temp, _this, _ret;

		babelHelpers.classCallCheck(this, List);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(List)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.cache = {}, _this.state = {}, _this.memoize = function (param) {
			if (!this.cache[param]) {
				var result = getMonth(param); //custom function
				this.cache[param] = result;
			}
			return this.cache[param];
		}, _this.monthHeights = [], _this.getMonthHeight = function (_ref) {
			var index = _ref.index;

			if (!_this.monthHeights[index]) {
				var _this$props = _this.props;
				var locale = _this$props.locale;
				var months = _this$props.months;
				var rowHeight = _this$props.rowHeight;

				var date = months[index];
				var weeks = getWeeksInMonth(date, locale);
				var height = weeks * rowHeight;
				_this.monthHeights[index] = height;
			}

			return _this.monthHeights[index];
		}, _this.getMonthIndex = function (date) {
			var min = _this.props.min.date;
			var index = date.diff(min, 'months');

			return index;
		}, _this.getDateOffset = function (date) {
			if (date && date.date && (moment.isMoment(date.date) || date.date._isAMomentObject)) date = date.date;
			if (!date || (!moment.isMoment(date) && !date._isAMomentObject)) date = moment(date);
			var _this$props2 = _this.props;
			var min = _this$props2.min;
			var rowHeight = _this$props2.rowHeight;

			var minMom = (min && min.date && (moment.isMoment(min.date) || min.date._isAMomentObject)) ? min.date : (min && (moment.isMoment(min) || min._isAMomentObject)) ? min : (min && min.year) ? moment(new Date(min.year, min.month, min.day || 1)) : moment(min);
			var weeks = date.clone().startOf('week').diff(minMom.clone().startOf('month'), 'weeks');

			return weeks * rowHeight + rowHeight;
		}, _this.getCurrentOffset = function () {
			if (_this.scrollEl) {
				return _this.scrollEl.scrollTop;
			}
		}, _this.isDateVisible = function (date) {
			if (!_this.scrollEl) return false;
			var currentScrollTop = _this.scrollEl.scrollTop;
			var containerHeight = _this.scrollEl.clientHeight || _this.props.height || 270;
			if (containerHeight < 100) containerHeight = 270;
			var targetOffset = _this.getDateOffset(date);
			var rowHeight = _this.props.rowHeight || 40;

			var isAbove = targetOffset < currentScrollTop;
			var isBelow = (targetOffset + rowHeight) > (currentScrollTop + containerHeight);

			return !isAbove && !isBelow;
		}, _this.scrollToDate = function (date) {
			var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
			var forceScroll = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
			var animated = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

			if (!date) return;
			var targetOffsetTop = _this.getDateOffset(date) + offset;

			if (!forceScroll && _this.isDateVisible(date)) {
				return;
			}

			_this._initScrollTop = targetOffsetTop;

			if (animated && _this.scrollEl && typeof _this.scrollEl.scrollTo === 'function') {
				_this.scrollEl.scrollTo({
					top: targetOffsetTop,
					behavior: 'smooth'
				});
			} else {
				if (_this.refs.VirtualScroll && typeof _this.refs.VirtualScroll.scrollToPosition === 'function') {
					_this.refs.VirtualScroll.scrollToPosition(targetOffsetTop);
				}
				_this.scrollTo(targetOffsetTop, false);
			}
		}, _this.scrollTo = function () {
			var scrollTop = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var animated = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			if (_this.scrollEl) {
				if (animated && typeof _this.scrollEl.scrollTo === 'function') {
					_this.scrollEl.scrollTo({
						top: scrollTop,
						behavior: 'smooth'
					});
				} else {
					_this.scrollEl.scrollTop = scrollTop;
				}
			}
		}, _this.renderMonth = function (_ref2) {
			var index = _ref2.index;
			var isScrolling = _ref2.isScrolling;
			var _this$props3 = _this.props;
			var disabledDates = _this$props3.disabledDates;
			var disabledDays = _this$props3.disabledDays;
			var locale = _this$props3.locale;
			var months = _this$props3.months;
			var maxDate = _this$props3.maxDate;
			var minDate = _this$props3.minDate;
			var onDaySelect = _this$props3.onDaySelect;
			var onWeekSelect = _this$props3.onWeekSelect;
			var rowHeight = _this$props3.rowHeight;
			var selectedDate = _this$props3.selectedDate;
			var selectedWeek = _this$props3.selectedWeek;
			var showOverlay = _this$props3.showOverlay;
			var theme = _this$props3.theme;
			var today = _this$props3.today;
			var showSelectionText = _this$props3.showSelectionText;
			var hideYearsOnDate = _this$props3.hideYearsOnDate;

			var _this$memoize = _this.memoize(months[index]);

			var date = _this$memoize.date;
			var rows = _this$memoize.rows;
			var weeks = _this$memoize.weeks;


			return React.createElement(Month, {
				key: 'Month-' + index,
				selectedDate: selectedDate,
				selectedWeek: selectedWeek,
				displayDate: date,
				disabledDates: disabledDates,
				disabledDays: disabledDays,
				maxDate: maxDate,
				minDate: minDate,
				onDaySelect: onDaySelect,
				onWeekSelect: onWeekSelect,
				rows: rows,
				weeks: weeks,
				rowHeight: rowHeight,
				isScrolling: isScrolling,
				showOverlay: showOverlay,
				today: today,
				theme: theme,
				locale: locale,
				showSelectionText: showSelectionText,
				hideYearsOnDate: hideYearsOnDate
			});
		}, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
	}

	babelHelpers.createClass(List, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var vs = this.refs.VirtualScroll;
			var grid = vs && vs.Grid || vs && vs._grid;
			this.scrollEl = grid && grid._scrollingContainer;
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			var selectedDate = nextProps.selectedDate;
			var selectedWeek = nextProps.selectedWeek;
			var targetDate = (selectedDate && selectedDate.date) || (selectedWeek && selectedWeek.date) || (selectedWeek && (moment.isMoment(selectedWeek) || selectedWeek._isAMomentObject) ? selectedWeek : null) || (selectedWeek ? moment(selectedWeek) : null) || (selectedDate ? moment(selectedDate) : null);
			if (targetDate) {
				this.scrollToDate(targetDate, 0);
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _props = this.props;
			var height = _props.height;
			var isScrolling = _props.isScrolling;
			var onScroll = _props.onScroll;
			var overscanMonthCount = _props.overscanMonthCount;
			var months = _props.months;
			var rowHeight = _props.rowHeight;
			var selectedDate = _props.selectedDate;
			var selectedWeek = _props.selectedWeek;
			var today = _props.today;
			var width = _props.width;

			var targetDate = (selectedDate && selectedDate.date) || (selectedWeek && selectedWeek.date) || (selectedWeek && (moment.isMoment(selectedWeek) || selectedWeek._isAMomentObject) ? selectedWeek : null) || (selectedWeek ? moment(selectedWeek) : null) || (selectedDate ? moment(selectedDate) : null) || today.date;
			this._initScrollTop = this.getDateOffset(targetDate);
			if (typeof width == 'string' && width.indexOf('%') !== -1) {
				width = window.innerWidth * parseInt(width.replace('%', ''), 10) / 100; // See https://github.com/bvaughn/react-virtualized/issues/229
			}

			return React.createElement(VirtualScroll, {
				ref: 'VirtualScroll',
				width: width,
				height: height,
				rowCount: months.length,
				rowHeight: this.getMonthHeight,
				estimatedRowSize: rowHeight * 5,
				rowRenderer: this.renderMonth,
				onScroll: onScroll,
				scrollTop: this._initScrollTop,
				className: classNames(style.root, babelHelpers.defineProperty({}, style.scrolling, isScrolling)),
				style: { lineHeight: rowHeight + 'px' },
				overscanRowCount: overscanMonthCount
			});
		}
	}]);
	return List;
}(Component);

List.propTypes = {
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	height: PropTypes.number,
	rowHeight: PropTypes.number,
	selectedDate: PropTypes.object,
	selectedWeek: PropTypes.object,
	disabledDates: PropTypes.arrayOf(PropTypes.string),
	disabledDays: PropTypes.arrayOf(PropTypes.number),
	months: PropTypes.arrayOf(PropTypes.object),
	onDaySelect: PropTypes.func,
	onWeekSelect: PropTypes.func,
	onScroll: PropTypes.func,
	overscanMonthCount: PropTypes.number,
	isScrolling: PropTypes.bool,
	today: validParsedDate,
	min: validParsedDate,
	minDate: validParsedDate,
	maxDate: validParsedDate,
	showOverlay: PropTypes.bool,
	theme: PropTypes.object,
	locale: PropTypes.object,
	showSelectionText: PropTypes.bool,
	hideYearsOnDate: PropTypes.bool
};
export default List;