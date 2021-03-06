import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import moment from 'moment';
import range from 'lodash/range';
import { scrollbarSize } from '../utils';
var style = {
	'root': 'Cal__Weekdays__root',
	'day': 'Cal__Weekdays__day',
	'weekColumn': 'Cal__Weekdays__weekColumn'
};

var Weekdays = function (_Component) {
	babelHelpers.inherits(Weekdays, _Component);

	function Weekdays() {
		babelHelpers.classCallCheck(this, Weekdays);
		return babelHelpers.possibleConstructorReturn(this, (Weekdays.__proto__ || Object.getPrototypeOf(Weekdays)).apply(this, arguments));
	}

	babelHelpers.createClass(Weekdays, [{
		key: 'shouldComponentUpdate',
		value: function shouldComponentUpdate(nextProps) {
			return shallowCompare(this, nextProps);
		}
	}, {
		key: 'render',
		value: function render() {
			var _props = this.props;
			var theme = _props.theme;
			var locale = _props.locale;


			return React.createElement(
				'ul',
				{ className: style.root, style: { backgroundColor: theme.weekdayColor, color: theme.textColor.default } },
				range(0, 8).map(function (val, index) {
					if (index === 0) {
						return React.createElement('li', { key: 'Week-column', className: style.weekColumn });
					} else {
						return React.createElement(
							'li',
							{ key: 'Weekday-' + index, className: style.day },
							moment().weekday(index - 1).format('dd').substring(1, 0)
						);
					}
				})
			);
		}
	}]);
	return Weekdays;
}(Component);

Weekdays.propTypes = {
	locale: PropTypes.object,
	theme: PropTypes.object
};
export default Weekdays;