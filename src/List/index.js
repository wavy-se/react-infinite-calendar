import React, {Component, PropTypes} from 'react';
import {VirtualScroll} from 'react-virtualized';
import classNames from 'classnames';
import moment from 'moment';
import {getMonth, getWeeksInMonth, validParsedDate} from '../utils';
import Month from '../Month';

const style   = require('./List.scss');

export default class List extends Component {
	static propTypes = {
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
		hideYearsOnDate: PropTypes.bool,
	};
	componentDidMount() {
		let vs = this.refs.VirtualScroll;
		let grid = vs && vs.Grid || vs && vs._grid;
		this.scrollEl = grid && grid._scrollingContainer;
	}

	cache = {};
	state = {};
	memoize = function(param) {
		if (!this.cache[param]) {
			var result = getMonth(param); //custom function
			this.cache[param] = result;
		}
		return this.cache[param];
	}
	monthHeights = [];
	getMonthHeight = ({index}) => {
		if (!this.monthHeights[index]) {
			let {locale, months, rowHeight} = this.props;
			let date = months[index];
			let weeks = getWeeksInMonth(date, locale);
			let height = weeks * rowHeight;
			this.monthHeights[index] = height;
		}

		return this.monthHeights[index];
	};
	getMonthIndex = (date) => {
		let min = this.props.min.date;
		let index = date.diff(min, 'months');

		return index;
	};
	normalizeDate = (date) => {
		// Accepts a parsed {date, yyyymmdd} object, a moment, or anything moment
		// can parse (Date, ISO string). Returns a moment or null.
		if (!date) return null;
		if (date.date && moment.isMoment(date.date)) return date.date;
		if (moment.isMoment(date)) return date;
		return moment(date);
	};
	getDateOffset = (date) => {
		let {min, rowHeight} = this.props;
		let dateMoment = this.normalizeDate(date) || moment();
		let minMoment = this.normalizeDate(min) || moment();
		let weeks = dateMoment.clone().startOf('week').diff(minMoment.clone().startOf('month'), 'weeks');

		return (weeks * rowHeight) + rowHeight;
	};
	getCurrentOffset = () => {
		if (this.scrollEl) {
			return this.scrollEl.scrollTop;
		}
	}
	isDateVisible = (date) => {
		if (!this.scrollEl) return false;
		let {height, rowHeight} = this.props;
		// clientHeight can report ~0 while the picker is collapsed (the outer
		// container clips with overflow: hidden) — fall back to the expanded
		// height so the visibility check reflects what an expanded picker shows.
		let containerHeight = this.scrollEl.clientHeight;
		if (!containerHeight || containerHeight < 100) containerHeight = height || 270;
		let targetOffset = this.getDateOffset(date);
		let currentScrollTop = this.scrollEl.scrollTop;
		let isAbove = targetOffset < currentScrollTop;
		let isBelow = (targetOffset + (rowHeight || 40)) > (currentScrollTop + containerHeight);

		return !isAbove && !isBelow;
	};
	scrollToDate = (date, offset = 0, forceScroll = false, animated = true) => {
		if (!date) return;
		let offsetTop = this.getDateOffset(date);

		// Already in view: leave the scroll position alone so selecting an
		// adjacent visible week/day only moves the selection indicator.
		if (!forceScroll && this.isDateVisible(date)) return;

		this.scrollTo(offsetTop + offset, animated);
	};
	scrollTo = (scrollTop = 0, animated = false) => {
		if (this.scrollEl) {
			if (animated && typeof this.scrollEl.scrollTo === 'function') {
				this.scrollEl.scrollTo({top: scrollTop, behavior: 'smooth'});
			} else {
				this.scrollEl.scrollTop = scrollTop;
			}
		}
	};
	renderMonth = ({index, isScrolling}) => {
		let {disabledDates, disabledDays, locale, months, maxDate, minDate, onDaySelect, onWeekSelect, rowHeight, selectedDate, selectedWeek, showOverlay, theme, today, showSelectionText, hideYearsOnDate} = this.props;
		let {date, rows, weeks} = this.memoize(months[index]);

		return (
			<Month
				key={`Month-${index}`}
				selectedDate={selectedDate}
				selectedWeek={selectedWeek}
				displayDate={date}
				disabledDates={disabledDates}
				disabledDays={disabledDays}
				maxDate={maxDate}
				minDate={minDate}
				onDaySelect={onDaySelect}
				onWeekSelect={onWeekSelect}
				rows={rows}
				weeks={weeks}
				rowHeight={rowHeight}
				isScrolling={isScrolling}
				showOverlay={showOverlay}
				today={today}
				theme={theme}
				locale={locale}
				showSelectionText={showSelectionText}
				hideYearsOnDate={hideYearsOnDate}
			/>
		);
	};
	render() {
		let {height, isScrolling, onScroll, overscanMonthCount, months, rowHeight, selectedDate, selectedWeek, today, width} = this.props;
		// Initial scroll position only — the scrollTop prop must stay constant
		// after mount so VirtualScroll doesn't snap while scrollToDate animates.
		if (!this._initScrollTop) {
			let target = selectedDate && selectedDate.date || selectedWeek && selectedWeek.date || today.date;
			this._initScrollTop = this.getDateOffset(target);
		}
		if (typeof width == 'string' && width.indexOf('%') !== -1) {
			width = window.innerWidth * parseInt(width.replace('%', ''), 10) / 100; // See https://github.com/bvaughn/react-virtualized/issues/229
		}

		return (
			<VirtualScroll
				ref="VirtualScroll"
				width={width}
				height={height}
				rowCount={months.length}
				rowHeight={this.getMonthHeight}
				estimatedRowSize={rowHeight * 5}
				rowRenderer={this.renderMonth}
				onScroll={onScroll}
				scrollTop={this._initScrollTop}
				className={classNames(style.root, {[style.scrolling]: isScrolling})}
				style={{lineHeight: `${rowHeight}px`}}
				overscanRowCount={overscanMonthCount}
			/>
		);
	}
}
