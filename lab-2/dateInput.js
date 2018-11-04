var element = (function() {
	return function(tag) {
		return document.createElement(tag);
	};
})();

var textOutput = (function() {
	return function() {
		var node = element('input');
		node.setAttribute('type', 'text');
		// todo
		return {
			getRoot: function() {
				return node;
			},
			setDate: function(date) {
				node.value = date;
			}
		};
	};
})();

var button = (function() {
	return {
		create: function(innerHTML, click_listener)  {
			var button = element('button');
			button.innerHTML = innerHTML;
			button.addEventListener('click', click_listener, true);
			return button;
		}
	};
})();
var nextPreviousButton = (function() {
	return {
		create: function(previous_listener, next_listener) {
			var node = element('tr');
			var label = element('td');
			label.setAttribute('class', 'switcher-label');
			var ld = element('td');
			var rd = element('td');
			var left_button = button.create('<', previous_listener);
			left_button.setAttribute('class', 'left-button');
			ld.appendChild(left_button);
			node.appendChild(ld);
			node.appendChild(label);
			var right_button = button.create('>', next_listener);
			right_button.setAttribute('class', 'right-button');
			rd.appendChild(right_button);
			node.appendChild(rd);

			return {
				getRoot: function() {
					return node;
				},
				getPrevious: function() {
					return previous;
				},
				getNext: function() {
					return next;
				},
				setLabel: function(innerHTML) {
					label.innerHTML = innerHTML;
				}
			};
		}
	};
})();
var dayTableHeading = (function() {
	var weekdays = ['Mo', 'Tu', 'We', 'Th', "Fr", 'Sa', 'Su'];
	var node = element('tr');
	for (var i in weekdays) {
		var data = element('th');
		data.innerHTML = weekdays[i];
		node.appendChild(data);
	}
	return {
		create: function() {
			return node;
		}
	};
})();
var dayButtonWrapper = (function() {
	return function(side_effect) {
		var selected_day = element('div');
		function select() {
			side_effect(selected_day);
			selected_day.setAttribute('class', 'active');
		};
		function deselect() {
			selected_day.setAttribute('class', '');
		};
		return {
			createButton: function(innerHTML) {
				var node = element('td');
				node.innerHTML = innerHTML;
				function listener() {
					deselect();
					selected_day = node;
					select();
				};
				node.addEventListener('click', listener, true);
				return node;
			},
			getSelected: function() {
				return selected_day;
			}
		};
	};
})();

var dateIterable = (function() {
	var month_day_count = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	return function(weekday, day, month, year) {
		function isLeap() {
			return year%400 == 0 || year%100 && year%4 == 0;
		};
		function monthDayCount() {
			return month != 1 ? month_day_count[month] : isLeap() ? 29 : 28;
		}
		function yearDayCount() {
			return isLeap() ? 366 : 365;
		}
		return {
			currentWeekday: function() { return weekday; },
			currentDay: function() { return day; },
			currentMonth: function() { return month; },
			currentYear: function() { return year; },
			
			firstDayWeekday: function() { 
				return 7 - (35 + (day - 1) - weekday) % 7;
			},
			previousMonth: function() {
				--month;
				if (month < 0) {
					--year;
					month = 11;
				}
				console.log(weekday + ' of ' + (month + 1) + ' to prev [' + month + '] = ' + monthDayCount());
				weekday = 7 - (monthDayCount() - weekday) % 7;
			},
			nextMonth: function() {
				console.log(weekday + ' of ' + month + ' to next [' + (month + 1) + '] = ' + monthDayCount());
				weekday = (weekday + monthDayCount()) % 7;
				++month;
				if (month > 11) {
					++year;
					month = 0;
				}
			},
			previousYear: function() { 
				--year;
				weekday = 7 - (yearDayCount() - weekday) % 7;
			},
			nextYear: function() { 
				weekday = (weekday + yearDayCount()) % 7;
				++year;
			},
			monthDayCount: monthDayCount
		};
	};
})();

var dayTable = (function() {
	return {
		// weekdays 0..6
		// months 0..11
		create: function(date, day_button_wrapper) {
			var node = element('tr');
			node.appendChild(dayTableHeading.create());
			/*for (var i = 6; i; --i) {
				var row = element('tr');
				for (var j = 7; j; --j) {
					row.appendChild(day_button_wrapper.createButton(0));
				}
				node.appendChild(row.getRoot());
			}*/

			var current_month_day_count = date.monthDayCount();
			var month_first_day_weekday = date.firstDayWeekday();
			console.log('date = ' + date.currentWeekday() + ' ' + date.currentDay() + ' ' + date.currentMonth() + ' ' + date.currentYear());
			
			date.previousMonth();
			var row = element('tr');
			var days_showed = month_first_day_weekday == 0 ? 7 : month_first_day_weekday;
			for (var i = days_showed; i > 0; --i) {
				var day_button = day_button_wrapper.createButton(date.monthDayCount() - i + 1);
				day_button.setAttribute('class', 'previous');
				row.appendChild(day_button);
			}
			date.nextMonth();

			var day_counter = 1;
			var days_left = 7 - days_showed;
			for (var i = days_left; i > 0; --i) {
				var day_button = day_button_wrapper.createButton(day_counter);
				day_button.setAttribute('class', 'current');
				row.appendChild(day_button);
				++day_counter;
			}
			node.appendChild(row);

			var full_weeks_count = Math.trunc((current_month_day_count - day_counter) / 7);
			for (var i = full_weeks_count; i > 0; --i) {
				var row = element('tr');
				for (var j = 7; j > 0 && day_counter <= current_month_day_count; --j) {
					var day_button = day_button_wrapper.createButton(day_counter);
					day_button.setAttribute('class', 'current');
					row.appendChild(day_button);
					++day_counter;
				}
				node.appendChild(row);
			}

			row = element('tr');
			days_left = current_month_day_count - day_counter + 1;
			for (var i = days_left; i > 0; --i) {
				var day_button = day_button_wrapper.createButton(day_counter);
				day_button.setAttribute('class', 'current');
				row.appendChild(day_button);
				++day_counter;
			}

			var next_counter = 1;
			for (var i = 7 - days_left; i > 0; --i) {
				var day_button = day_button_wrapper.createButton(next_counter);
				day_button.setAttribute('class', 'next');
				row.appendChild(day_button);
				++next_counter;
			}
			node.appendChild(row);

			for (var i = 4 - full_weeks_count; i > 0; --i) {
				var row = element('tr');
				for (var j = 7; j > 0; --j) {
					var day_button = day_button_wrapper.createButton(next_counter);
					day_button.setAttribute('class', 'next');
					row.appendChild(day_button);
					++next_counter;
				}
				node.appendChild(row);
			}

			return {
				getRoot: function() {
					return node;
				},
				getSelected: function() {
					return day_button_wrapper.getSelected();
				}
			};
		}
	};	
})();


var dateInput = (function() {

	return function(day_button_wrapper) {
		var node = element('table');
		node.style.display = 'none';

		var close_button = button.create('close', function() {
			node.style.display = 'none';
		});

		var date = dateIterable(5, 3, 10, 2018);
		var day_table = dayTable.create(date, day_button_wrapper);


		function resetDateTable(date) {
			node.removeChild(day_table.getRoot());
			delete day_table;
			year_switcher.setLabel(date.currentYear());
			month_switcher.setLabel(date.currentMonth() + 1);
			day_table = dayTable.create(date, day_button_wrapper);
			node.appendChild(day_table.getRoot());
		};
		
		
		var year_switcher = nextPreviousButton.create(
			function() {
				date.previousYear();
				resetDateTable(date);
			},
			function() {
				date.nextYear();
				resetDateTable(date);
			});
		var month_switcher = nextPreviousButton.create(
			function() {
				date.previousMonth();
				resetDateTable(date);
			},
			function() {
				date.nextMonth();
				resetDateTable(date);
			});
		month_switcher.setLabel(date.currentMonth() + 1);
		year_switcher.setLabel(date.currentYear());

		node.appendChild(close_button);
		node.appendChild(year_switcher.getRoot());
		node.appendChild(month_switcher.getRoot());

		node.appendChild(day_table.getRoot());

		return {
			getRoot: function() {
				return node;
			},
			getDate: function() {
				return date;
			},
			display: function() {
				node.style.display = 'block';
			},
			hide: function() {
				node.style.display = 'node';
			}
		};
	}
})();
var datePick = (function() {
	return function() {
		var node = element('div');

		var day_button_wrapper = dayButtonWrapper(function(selected_day) {
			output.setDate((function(date) {
				switch (selected_day.getAttribute('class')) {
					case 'previous': 
						date.previousMonth();
						break;
					case 'next':
						date.nextMonth();
						break;
				}
				return selected_day.innerHTML + '.' + (date.currentMonth() + 1) +  '.' + date.currentYear();
			})(input.getDate()));
		});
		
		var input = dateInput(day_button_wrapper);
		var output = textOutput();
		output.getRoot().addEventListener('click', function() { input.display(); }, true);
		node.appendChild(output.getRoot());
		node.appendChild(input.getRoot());
		output.getRoot().value = 'i hate u, js';
		
		return node;
	};		
})();
