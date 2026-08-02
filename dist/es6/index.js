import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import debounce from 'lodash/debounce';
import range from 'lodash/range';
import { getScrollSpeed, getMonthsForYear, keyCodes, parseDate, validDate, validDisplay, validLayout } from './utils';
import defaultLocale from './locale';
import defaultTheme from './theme';
import Today from './Today';
import Header from './Header';
import List from './List';
import Weekdays from './Weekdays';
import Shortcuts from './Shortcuts';
import Years from './Years';

var onClickOutside = require('react-onclickoutside');
var containerStyle = {
	'root': 'Cal__Container__root',
	'landscape': 'Cal__Container__landscape',
	'wrapper': 'Cal__Container__wrapper',
	'listWrapper': 'Cal__Container__listWrapper'
};
var expansionButtonStyle = {
	'root': 'Cal__ExpansionButton__root'
};
var dayStyle = {
	'root': 'Cal__Day__root',
	'today': 'Cal__Day__today',
	'weekSelected': 'Cal__Day__weekSelected',
	'selected': 'Cal__Day__selected',
	'month': 'Cal__Day__month',
	'year': 'Cal__Day__year',
	'selection': 'Cal__Day__selection',
	'day': 'Cal__Day__day',
	'dayHiddenText': 'Cal__Day__dayHiddenText',
	'disabled': 'Cal__Day__disabled',
	'weekend': 'Cal__Day__weekend',
	'past': 'Cal__Day__past'
};
var weekStyle = {
	'root': 'Cal__Week__root',
	'weekItem': 'Cal__Week__weekItem',
	'weekSelected': 'Cal__Week__weekSelected',
	'weekNumber': 'Cal__Week__weekNumber',
	'weekDistance': 'Cal__Week__weekDistance'
};
var style = {
	container: containerStyle,
	day: dayStyle,
	week: weekStyle,
	expansionButton: expansionButtonStyle
};

var InfiniteCalendar = function (_Component) {
	babelHelpers.inherits(InfiniteCalendar, _Component);

	function InfiniteCalendar(props) {
		babelHelpers.classCallCheck(this, InfiniteCalendar);

		// Initialize
		var _this = babelHelpers.possibleConstructorReturn(this, (InfiniteCalendar.__proto__ || Object.getPrototypeOf(InfiniteCalendar)).call(this));

		_this.onDaySelect = function (selectedDate, e) {
			var shouldHeaderAnimate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _this.props.shouldHeaderAnimate;

			if (selectedDate !== _this.state.selectedDate) {
				var _this$props = _this.props,
				    afterSelect = _this$props.afterSelect,
				    beforeSelect = _this$props.beforeSelect,
				    onSelect = _this$props.onSelect;


				_this.setState({
					isClickOnDatepicker: true
				});

				if (!beforeSelect || typeof beforeSelect == 'function' && beforeSelect(selectedDate)) {
					if (typeof onSelect == 'function') {
						onSelect(selectedDate, e);
					}

					_this.setState({
						isCollapsed: _this.state.desktop
					});

					_this.setState({
						selectedDate: selectedDate,
						selectedWeek: null
					}, function () {
						_this.clearHighlight();

						if (selectedDate) {
							_this.scrollToDate(selectedDate, 0);
						}

						if (typeof afterSelect == 'function') {
							afterSelect(selectedDate);
						}
					});
				}
			}
		};

		_this.onWeekSelect = function (selectedWeek, e) {
			if (selectedWeek !== _this.state.selectedWeek) {
				var _this$props2 = _this.props,
				    afterSelect = _this$props2.afterSelect,
				    beforeSelect = _this$props2.beforeSelect,
				    onSelect = _this$props2.onSelect;


				if (!beforeSelect || typeof beforeSelect == 'function' && beforeSelect(selectedWeek)) {
					if (typeof onSelect == 'function') {
						onSelect(selectedWeek, e);
					}

					_this.setState({
						isCollapsed: _this.state.desktop
					});

					_this.setState({
						selectedWeek: selectedWeek,
						selectedDate: null,
						isClickOnDatepicker: true
					}, function () {
						_this.clearHighlight();

						if (selectedWeek) {
							_this.scrollToDate(selectedWeek, 0);
						}

						if (typeof afterSelect == 'function') {
							afterSelect(selectedWeek);
						}
					});
				}
			}
		};

		_this.getCurrentOffset = function () {
			return _this.scrollTop;
		};

		_this.getDateOffset = function (date) {
			return _this.list && _this.list.getDateOffset(date);
		};

		_this.scrollTo = function (offset) {
			return _this.list && _this.list.scrollTo(offset);
		};

		_this.scrollToDate = function () {
			var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : moment();
			var offset = arguments[1];
			var forceScroll = arguments[2];
			var animated = arguments[3];

			// Scrolling must never change the collapsed/expanded state — collapsing
			// is decided by the select handlers and handleClickOutside.
			_this.setState({
				isScrolling: false,
				expandOnScroll: false
			}, function () {
				if (_this.list) {
					_this.list.scrollToDate(date, offset, forceScroll, animated);
				}
			});
		};

		_this.handleExpansionClick = function () {
			_this.setState({
				isCollapsed: false
			}, function () {
				// Wait for the expansion before positioning, so the visibility check
				// in List.scrollToDate sees the expanded viewport.
				var targetDate = _this.state.selectedWeek || _this.state.selectedDate;
				if (targetDate) {
					setTimeout(function () {
						_this.scrollToDate(targetDate, 0);
					}, 50);
				}
			});
		};

		_this.getScrollSpeed = getScrollSpeed();

		_this.onScroll = function (_ref) {
			var scrollTop = _ref.scrollTop;
			var _this$props3 = _this.props,
			    onScroll = _this$props3.onScroll,
			    showOverlay = _this$props3.showOverlay,
			    showTodayHelper = _this$props3.showTodayHelper,
			    device = _this$props3.device;
			var _this$state = _this.state,
			    isScrolling = _this$state.isScrolling,
			    isTouchStarted = _this$state.isTouchStarted,
			    isScrollEnded = _this$state.isScrollEnded,
			    isCollapsed = _this$state.isCollapsed,
			    expandOnScroll = _this$state.expandOnScroll;

			var scrollSpeed = _this.scrollSpeed = Math.abs(_this.getScrollSpeed(scrollTop));
			_this.scrollTop = scrollTop;

			if (!isScrolling && scrollSpeed > 10) {
				_this.setState({
					isScrolling: true
				});
			}

			if (isCollapsed && !device && expandOnScroll) {
				_this.setState({
					isCollapsed: false
				});
			}

			if (showTodayHelper) {
				_this.updateTodayHelperPosition(scrollSpeed);
			}

			if (typeof onScroll == 'function') {
				onScroll(scrollTop);
			}

			_this.onScrollEnd();
		};

		_this.onScrollEnd = debounce(function () {
			var _this$props4 = _this.props,
			    onScrollEnd = _this$props4.onScrollEnd,
			    showTodayHelper = _this$props4.showTodayHelper;
			var _this$state2 = _this.state,
			    isScrolling = _this$state2.isScrolling,
			    isTouchStarted = _this$state2.isTouchStarted;


			_this.setState({
				isScrollEnded: true,
				expandOnScroll: true
			});

			if (isScrolling && !isTouchStarted) _this.setState({ isScrolling: false });
			if (showTodayHelper) _this.updateTodayHelperPosition(0);
			if (typeof onScrollEnd == 'function') onScrollEnd(_this.scrollTop);
		}, 150);

		_this.handleTouchStart = function () {
			if (!_this.state.isTouchStarted) {
				_this.setState({
					isTouchStarted: true,
					isScrollEnded: false
				});
			}
		};

		_this.handleTouchEnd = function () {
			_this.setState({
				isTouchStarted: false
			});

			if (_this.state.isScrollEnded) {
				_this.setState({
					isScrolling: false
				});

				_this.forceUpdate();
			}
		};

		_this.updateTodayHelperPosition = function (scrollSpeed) {
			var date = _this.today.date;
			if (!_this.todayOffset) _this.todayOffset = _this.getDateOffset(date); //scrollTop offset of the month "today" is in

			var scrollTop = _this.scrollTop;
			var showToday = _this.state.showToday;
			var _this$props5 = _this.props,
			    height = _this$props5.height,
			    rowHeight = _this$props5.rowHeight,
			    todayHelperRowOffset = _this$props5.todayHelperRowOffset;

			var newState = void 0;
			var dayOffset = Math.ceil((date.date() - 7 + moment(date).startOf("month").day()) / 7) * rowHeight; //offset of "today" within its month

			if (scrollTop >= _this.todayOffset + dayOffset + rowHeight * (todayHelperRowOffset + 1)) {
				if (showToday !== 1) newState = 1; //today is above the fold
			} else if (scrollTop + height <= _this.todayOffset + dayOffset + rowHeight - rowHeight * (todayHelperRowOffset + 1)) {
				if (showToday !== -1) newState = -1; //today is below the fold
			} else if (showToday && scrollSpeed <= 1) {
				newState = false;
			}

			if (scrollTop == 0) {
				newState = false;
			}

			if (newState != null) {
				_this.setState({ showToday: newState });
			}
		};

		_this.handleKeyDown = function (e) {
			var _this$props6 = _this.props,
			    maxDate = _this$props6.maxDate,
			    minDate = _this$props6.minDate,
			    onKeyDown = _this$props6.onKeyDown;
			var _this$state3 = _this.state,
			    display = _this$state3.display,
			    selectedDate = _this$state3.selectedDate,
			    highlightedDate = _this$state3.highlightedDate,
			    showToday = _this$state3.showToday;

			var delta = 0;

			if (typeof onKeyDown == 'function') {
				onKeyDown(e);
			}
			if ([keyCodes.left, keyCodes.up, keyCodes.right, keyCodes.down].indexOf(e.keyCode) > -1 && typeof e.preventDefault == 'function') {
				e.preventDefault();
			}

			if (!selectedDate) {
				selectedDate = moment();
			}

			if (display == 'days') {
				if (!highlightedDate) {
					highlightedDate = selectedDate.clone();
					_this.setState({ highlightedDate: highlightedDate });
				}

				switch (e.keyCode) {
					case keyCodes.enter:
						_this.onDaySelect(moment(highlightedDate), e);
						return;
					case keyCodes.left:
						delta = -1;
						break;
					case keyCodes.right:
						delta = +1;
						break;
					case keyCodes.down:
						delta = +7;
						break;
					case keyCodes.up:
						delta = -7;
						break;
				}

				if (delta) {
					var rowHeight = _this.props.rowHeight;

					var newHighlightedDate = moment(highlightedDate).add(delta, 'days');

					// Make sure the new highlighted date isn't before min / max
					if (newHighlightedDate.isBefore(minDate)) {
						newHighlightedDate = moment(minDate);
					} else if (newHighlightedDate.isAfter(maxDate)) {
						newHighlightedDate = moment(maxDate);
					}

					// Update the highlight indicator
					_this.clearHighlight();

					// Scroll the view
					if (!_this.currentOffset) _this.currentOffset = _this.getCurrentOffset();
					var currentOffset = _this.currentOffset;
					var monthOffset = _this.getDateOffset(newHighlightedDate);
					var navOffset = showToday ? 36 : 0;

					var highlightedEl = _this.highlightedEl = _this.node.querySelector('[data-date=\'' + newHighlightedDate.format('YYYYMMDD') + '\']');

					// Edge-case: if the user tries to use the keyboard when the new highlighted date isn't rendered because it's too far off-screen
					// We need to scroll to the month of the new highlighted date so it renders
					if (!highlightedEl) {
						_this.scrollTo(monthOffset - navOffset);
						return;
					}

					highlightedEl.classList.add(style.day.highlighted);

					var dateOffset = highlightedEl.offsetTop - rowHeight;
					var newOffset = monthOffset + dateOffset;

					if (currentOffset !== newOffset) {
						_this.currentOffset = newOffset;
						_this.scrollTo(newOffset - navOffset);
					}

					// Update the reference to the currently highlighted date
					_this.setState({
						highlightedDate: newHighlightedDate
					});
				}
			} else if (display == 'years' && _this.refs.years) {
				_this.refs.years.handleKeyDown(e);
			}
		};

		_this.setDisplay = function (display) {
			_this.setState({ display: display });
		};

		_this.updateLocale(props.locale);
		_this.updateYears(props);
		_this.state = {
			height: props.collapsedHeight,
			expandedHeight: props.expandedHeight,
			collapsedHeight: props.collapsedHeight,
			selectedWeek: _this.parseSelectedWeek(props.selectedWeek),
			selectedDate: _this.parseSelectedDate(props.selectedDate),
			display: props.display,
			shouldHeaderAnimate: props.shouldHeaderAnimate,
			isCollapsed: props.isCollapsed,
			expandOnScroll: false,
			desktop: props.desktop,
			device: props.device
		};
		return _this;
	}

	babelHelpers.createClass(InfiniteCalendar, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _props = this.props,
			    autoFocus = _props.autoFocus,
			    keyboardSupport = _props.keyboardSupport;

			this.node = this.refs.node;
			this.list = this.refs.List;

			if (keyboardSupport && autoFocus) {
				this.node.focus();
			}

			// Make sure the initial selection (day or week) is positioned in view.
			// The List's initial scrollTop covers the common case; this is a no-op
			// when the selection is already visible.
			var targetDate = this.state.selectedWeek || this.state.selectedDate;
			if (targetDate && this.list) {
				this.scrollToDate(targetDate, 0, false, false);
			}
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(next) {
			var _props2 = this.props,
			    min = _props2.min,
			    minDate = _props2.minDate,
			    max = _props2.max,
			    maxDate = _props2.maxDate,
			    locale = _props2.locale;
			var _state = this.state,
			    display = _state.display,
			    isClickOnDatepicker = _state.isClickOnDatepicker,
			    selectedWeek = _state.selectedWeek,
			    selectedDate = _state.selectedDate;


			var nextDate = this.parseSelectedDate(next.selectedDate);
			var nextWeek = this.parseSelectedWeek(next.selectedWeek);
			var stateDate = this.parseSelectedDate(selectedDate);
			var stateWeek = this.parseSelectedWeek(selectedWeek);

			this.setState({
				collapsedHeight: next.collapsedHeight,
				expandedHeight: next.expandedHeight
			});

			if (next.locale !== locale) {
				this.updateLocale(next.locale);
			}

			if (next.min !== min || next.minDate !== minDate || next.max !== max || next.maxDate !== maxDate) {
				this.updateYears(next);
			}

			// parseSelectedDate/parseSelectedWeek clamp to _minDate/_maxDate, so a
			// non-null result is always in range. Only react when the selection
			// actually changed — the parent may re-render with identical props, and
			// scrolling then would fight the user's own scrolling.
			if (next.selectedDate !== null && nextDate && (!stateDate || !nextDate.isSame(stateDate, 'day'))) {
				this.setState({
					selectedWeek: null,
					selectedDate: nextDate
				});

				this.clearHighlight();
				this.scrollToDate(nextDate, 0);
			}

			if (next.selectedWeek !== null && nextWeek && (!stateWeek || !nextWeek.isSame(stateWeek, 'week'))) {
				this.setState({
					selectedWeek: nextWeek,
					selectedDate: null
				});

				this.clearHighlight();
				this.scrollToDate(nextWeek, 0);
			}

			this.setState({
				isClickOnDatepicker: false
			});

			if (next.display !== display) {
				this.setState({
					display: next.display
				});
			}
		}
	}, {
		key: 'shouldComponentUpdate',
		value: function shouldComponentUpdate(nextProps, nextState) {
			// do not re-render on isTouchStarted and isScrollEnded state changes for a better scrolling experience
			var shouldUpdate = nextState.isTouchStarted === this.state.isTouchStarted && nextState.isScrollEnded === this.state.isScrollEnded;
			return shouldUpdate;
		}
	}, {
		key: 'handleClickOutside',
		value: function handleClickOutside(evt) {
			var _this2 = this;

			if (!this.state.isCollapsed && this.state.desktop) {
				this.setState({
					isCollapsed: true
				}, function () {
					_this2.clearHighlight();

					if (_this2.state.selectedDate !== null) {
						_this2.scrollToDate(_this2.state.selectedDate, 0);
					} else {
						_this2.scrollToDate(_this2.state.selectedWeek, 0);
					}
				});
			}
		}
	}, {
		key: 'parseSelectedDate',
		value: function parseSelectedDate(selectedDate) {
			if (selectedDate) {
				selectedDate = moment(selectedDate);

				// Selected Date should not be before min date or after max date
				if (selectedDate.isBefore(this._minDate)) {
					return this._minDate;
				} else if (selectedDate.isAfter(this._maxDate)) {
					return this._maxDate;
				}
			}

			return selectedDate;
		}
	}, {
		key: 'parseSelectedWeek',
		value: function parseSelectedWeek(selectedWeek) {
			if (selectedWeek) {
				selectedWeek = moment(selectedWeek);

				// Selected Date should not be before min date or after max date
				if (selectedWeek.isBefore(this._minDate)) {
					return this._minDate;
				} else if (selectedWeek.isAfter(this._maxDate)) {
					return this._maxDate;
				}
			}

			return selectedWeek;
		}
	}, {
		key: 'updateYears',
		value: function updateYears() {
			var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

			// min/max/minDate/maxDate may arrive as {year, month, day} objects (the
			// defaults and what Wavy Business passes), moments, or anything moment
			// can parse. Never go through new Date(string) — string parsing gives
			// Invalid Date in Safari/WebKit for non-ISO formats.
			var parseProp = function parseProp(value) {
				if (!value) return moment();
				if (moment.isMoment(value)) return value;
				if (value.date && moment.isMoment(value.date)) return value.date;
				if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && value.year !== undefined && value.month !== undefined) {
					return moment(new Date(value.year, value.month, value.day || value.date || 1));
				}
				return moment(value);
			};

			var min = this._min = parseProp(props.min);
			var max = this._max = parseProp(props.max);
			this._minDate = parseProp(props.minDate);
			this._maxDate = parseProp(props.maxDate);

			this.years = range(min.year(), max.year() + 1).map(function (year) {
				return getMonthsForYear(year, min, max);
			});
			this.months = [].concat.apply([], this.years);
		}
	}, {
		key: 'updateLocale',
		value: function updateLocale(locale) {
			locale = this.getLocale(locale);
			moment.updateLocale(locale.name, locale);
			moment.locale(locale.name);
		}
	}, {
		key: 'getDisabledDates',
		value: function getDisabledDates(disabledDates) {
			return disabledDates && disabledDates.map(function (date) {
				return moment(date).format('YYYYMMDD');
			});
		}
	}, {
		key: 'getLocale',
		value: function getLocale() {
			var customLocale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.locale;

			return Object.assign({}, defaultLocale, customLocale);
		}
	}, {
		key: 'getTheme',
		value: function getTheme() {
			var customTheme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.theme;

			return Object.assign({}, defaultTheme, customTheme);
		}
	}, {
		key: 'clearHighlight',
		value: function clearHighlight() {
			if (this.highlightedEl) {
				this.highlightedEl.classList.remove(style.day.highlighted);
				this.highlightedEl = null;
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _props3 = this.props,
			    className = _props3.className,
			    disabledDays = _props3.disabledDays,
			    hideYearsOnSelect = _props3.hideYearsOnSelect,
			    hideYearsOnDate = _props3.hideYearsOnDate,
			    keyboardSupport = _props3.keyboardSupport,
			    layout = _props3.layout,
			    overscanMonthCount = _props3.overscanMonthCount,
			    min = _props3.min,
			    minDate = _props3.minDate,
			    max = _props3.max,
			    maxDate = _props3.maxDate,
			    showTodayHelper = _props3.showTodayHelper,
			    showHeader = _props3.showHeader,
			    tabIndex = _props3.tabIndex,
			    width = _props3.width,
			    showSelectionText = _props3.showSelectionText,
			    device = _props3.device,
			    desktop = _props3.desktop,
			    other = babelHelpers.objectWithoutProperties(_props3, ['className', 'disabledDays', 'hideYearsOnSelect', 'hideYearsOnDate', 'keyboardSupport', 'layout', 'overscanMonthCount', 'min', 'minDate', 'max', 'maxDate', 'showTodayHelper', 'showHeader', 'tabIndex', 'width', 'showSelectionText', 'device', 'desktop']);

			var disabledDates = this.getDisabledDates(this.props.disabledDates);
			var locale = this.getLocale();
			var theme = this.getTheme();
			var _state2 = this.state,
			    display = _state2.display,
			    isScrolling = _state2.isScrolling,
			    isCollapsed = _state2.isCollapsed,
			    collapsedHeight = _state2.collapsedHeight,
			    expandedHeight = _state2.expandedHeight,
			    selectedDate = _state2.selectedDate,
			    selectedWeek = _state2.selectedWeek,
			    height = _state2.height,
			    showToday = _state2.showToday,
			    shouldHeaderAnimate = _state2.shouldHeaderAnimate;

			var today = this.today = parseDate(moment());

			// Selected date should not be disabled
			if (selectedDate && (disabledDates && disabledDates.indexOf(selectedDate.format('YYYYMMDD')) !== -1 || disabledDays && disabledDays.indexOf(selectedDate.day()) !== -1)) {
				selectedDate = null;
			}

			return React.createElement(
				'div',
				{
					tabIndex: tabIndex,
					onKeyDown: keyboardSupport && this.handleKeyDown,
					className: classNames(className, style.container.root, babelHelpers.defineProperty({}, style.container.landscape, layout == 'landscape')),
					style: { color: theme.textColor.default, width: '100%', overflow: isCollapsed ? 'hidden' : 'visible', height: collapsedHeight + "px" },
					'aria-label': 'Calendar', ref: 'node'
				},
				desktop && React.createElement('div', {
					className: classNames(style.expansionButton.root, 'ion-chevron-down'),
					style: { display: isCollapsed ? 'initial' : 'none' },
					onClick: this.handleExpansionClick
				}),
				showHeader && React.createElement(Header, {
					selectedDate: selectedDate,
					shouldHeaderAnimate: shouldHeaderAnimate,
					layout: layout,
					theme: theme,
					locale: locale,
					scrollToDate: this.scrollToDate,
					setDisplay: this.setDisplay,
					display: display
				}),
				React.createElement(
					'div',
					{ className: style.container.wrapper },
					React.createElement(Shortcuts, { theme: theme, locale: locale, scrollToDate: this.scrollToDate, handleTodayClick: selectedDate !== null ? this.onDaySelect : this.onWeekSelect }),
					React.createElement(Weekdays, { theme: theme, locale: locale }),
					React.createElement(
						'div',
						{
							className: style.container.listWrapper,
							onTouchStart: this.handleTouchStart,
							onTouchEnd: this.handleTouchEnd
						},
						React.createElement(List, babelHelpers.extends({
							ref: 'List'
						}, other, {
							width: width,
							height: expandedHeight,
							selectedDate: parseDate(selectedDate),
							selectedWeek: parseDate(selectedWeek),
							disabledDates: disabledDates,
							disabledDays: disabledDays,
							months: this.months,
							onDaySelect: this.onDaySelect,
							onWeekSelect: this.onWeekSelect,
							onScroll: this.onScroll,
							isScrolling: isScrolling,
							today: today,
							min: parseDate(min),
							minDate: parseDate(minDate),
							maxDate: parseDate(maxDate),
							theme: theme,
							locale: locale,
							overscanMonthCount: overscanMonthCount,
							showSelectionText: showSelectionText,
							hideYearsOnDate: hideYearsOnDate
						}))
					),
					display == 'years' && React.createElement(Years, {
						ref: 'years',
						width: width,
						height: height,
						onDaySelect: this.onDaySelect,
						minDate: minDate,
						maxDate: maxDate,
						selectedDate: selectedDate,
						theme: theme,
						years: range(moment(min).year(), moment(max).year() + 1),
						setDisplay: this.setDisplay,
						scrollToDate: this.scrollToDate,
						hideYearsOnSelect: hideYearsOnSelect
					})
				)
			);
		}
	}]);
	return InfiniteCalendar;
}(Component);

InfiniteCalendar.defaultProps = {
	width: 400,
	expandedHeight: 400,
	collapsedHeight: 200,
	isCollapsed: true,
	rowHeight: 40,
	overscanMonthCount: 4,
	todayHelperRowOffset: 4,
	layout: 'portrait',
	display: 'days',
	selectedDate: new Date(),
	selectedWeek: null,
	min: { year: moment().subtract(2, 'years').year(), month: 0, day: 0 },
	minDate: { year: moment().subtract(2, 'years').year(), month: 0, day: 0 },
	max: { year: moment().add(2, 'years').year(), month: 11, day: 31 },
	maxDate: { year: moment().add(2, 'years').year(), month: 11, day: 31 },
	keyboardSupport: false,
	autoFocus: true,
	shouldHeaderAnimate: true,
	showOverlay: true,
	showTodayHelper: false,
	showHeader: false,
	tabIndex: 1,
	locale: {},
	theme: {},
	hideYearsOnSelect: true,
	hideYearsOnDate: true,
	showSelectionText: true,
	isClickOnDatepicker: false,
	device: true,
	desktop: true
};
InfiniteCalendar.propTypes = {
	selectedDate: validDate,
	selectedWeek: validDate,
	min: validDate,
	max: validDate,
	minDate: validDate,
	maxDate: validDate,
	locale: PropTypes.object,
	theme: PropTypes.object,
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	expandedHeight: PropTypes.number,
	collapsedHeight: PropTypes.number,
	isCollapsed: PropTypes.bool,
	rowHeight: PropTypes.number,
	className: PropTypes.string,
	overscanMonthCount: PropTypes.number,
	todayHelperRowOffset: PropTypes.number,
	disabledDays: PropTypes.arrayOf(PropTypes.number),
	disabledDates: PropTypes.arrayOf(validDate),
	beforeSelect: PropTypes.func,
	onSelect: PropTypes.func,
	afterSelect: PropTypes.func,
	onScroll: PropTypes.func,
	onScrollEnd: PropTypes.func,
	keyboardSupport: PropTypes.bool,
	autoFocus: PropTypes.bool,
	onKeyDown: PropTypes.func,
	tabIndex: PropTypes.number,
	layout: validLayout,
	display: validDisplay,
	hideYearsOnSelect: PropTypes.bool,
	hideYearsOnDate: PropTypes.bool,
	shouldHeaderAnimate: PropTypes.bool,
	showOverlay: PropTypes.bool,
	showTodayHelper: PropTypes.bool,
	showHeader: PropTypes.bool,
	showSelectionText: PropTypes.bool,
	isClickOnDatepicker: PropTypes.bool,
	device: PropTypes.bool,
	desktop: PropTypes.bool
};
;

export default InfiniteCalendar = onClickOutside(InfiniteCalendar);