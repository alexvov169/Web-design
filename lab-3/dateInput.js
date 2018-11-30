var element = (function() {
	return function(tag) {
		return document.createElement(tag);
	};
})();

var textOutput = (function() {
	return function(target) {
		target.setAttribute('type', 'text');
		return {
			target: target,
			setDate: function(date) {
				target.value = date;
			}
		};
	};
})();


var button = (function() {
	return function(innerHTML, click_listener) {
		var button = element('td');
		button.setAttribute('class', 'button');
		button.innerHTML = innerHTML;
		button.addEventListener('click', click_listener, true);
		return button;
	};
})();





// for iterating through the calendar
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
				weekday = 7 - (monthDayCount() - weekday) % 7;
			},
			nextMonth: function() {
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

var nextPreviousButton = (function() {
	return function(target, create_data, previous_listener, next_listener) {
		var label = element('td');
		label.setAttribute('class', 'switcher-label');
		label.setAttribute('colspan', '5');
		
		var left_button = button('<', previous_listener);
		left_button.setAttribute('class', 'left-button');
		target.appendChild(left_button);
		target.appendChild(label);
		var right_button = button('>', next_listener);
		right_button.setAttribute('class', 'right-button');
		target.appendChild(right_button);
		
		return {
			target: target,
			setLabel: function(innerHTML) {
				label.innerHTML = innerHTML;
			}
		};
	}
})();

var dayButtonWrapper = (function() {
	return function(side_effect, create_data) {
		var selected_day = element('div');
		var selected_class = '';
		function select() {
			side_effect(selected_day);
			selected_class = selected_day.getAttribute('class');
			selected_day.setAttribute('class', 'active');
		};
		function deselect() {
			selected_day.setAttribute('class', selected_class);
		};
		return {
			createButton: function(innerHTML) {
				var target = create_data()
				target.innerHTML = innerHTML;
				function listener() {
					deselect();
					selected_day = target;
					select();
				};
				target.addEventListener('click', listener, true);
				return target;
			},
			getSelected: function() {
				return selected_day;
			}
		};
	};
})();


var dayTableHeadingMaker = (function() {
	return function(create_row, create_heading) {
		var weekdays = ['Mo', 'Tu', 'We', 'Th', "Fr", 'Sa', 'Su'];
		var target = create_row();
		for (var i in weekdays) {
			var data = create_heading();
			data.innerHTML = weekdays[i];
			target.appendChild(data);
		}
		return function() {
			return target;
		};
	};
})();

var datePick = (function() {
	return function(text_edit,
		date_container,
		close,
		year_switch, month_switch, day_switch,
		create_row, create_heading, create_data,
		Weekday, Day, Month, Year) {
			
			var day_table_heading = dayTableHeadingMaker(create_row, create_heading);
			
			
			var dayTable = (function() {
				// weekdays 0..6
				// months 0..11
				return function(target, date, day_button_wrapper) {
					target.appendChild(day_table_heading());
					/*for (var i = 6; i; --i) {
						var row = create_row();
						for (var j = 7; j; --j) {
							row.appendChild(day_button_wrapper.createButton(0));
						}
						target.appendChild(row.target);
					}*/
					
					var current_month_day_count = date.monthDayCount();
					var month_first_day_weekday = date.firstDayWeekday();
					
					date.previousMonth();
					var row = create_row();
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
					target.appendChild(row);
					
					var full_weeks_count = Math.trunc((current_month_day_count - day_counter) / 7);
					for (var i = full_weeks_count; i > 0; --i) {
						var row = create_row();
						for (var j = 7; j > 0 && day_counter <= current_month_day_count; --j) {
							var day_button = day_button_wrapper.createButton(day_counter);
							day_button.setAttribute('class', 'current');
							row.appendChild(day_button);
							++day_counter;
						}
						target.appendChild(row);
					}
					
					row = create_row();
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
					target.appendChild(row);
					
					for (var i = 4 - full_weeks_count; i > 0; --i) {
						var row = create_row();
						for (var j = 7; j > 0; --j) {
							var day_button = day_button_wrapper.createButton(next_counter);
							day_button.setAttribute('class', 'next');
							row.appendChild(day_button);
							++next_counter;
						}
						target.appendChild(row);
					}
					
					return {
						target: target,
						getSelected: function() {
							return day_button_wrapper.getSelected();
						}
					};
				};
			})();
			var dateInput = (function() {
				return function(target, day_button_wrapper, Weekday, Day, Month, Year) {
					target.style.display = 'none';
					
					close.addEventListener('click', function() { target.style.display = 'none'; }, true);
					
					var date = dateIterable(Weekday, Day, Month, Year);
					var day_table = dayTable(day_switch, date, day_button_wrapper);
					
					
					function resetDateTable(date) {
						day_switch.innerHTML = '';
						year_switcher.setLabel(date.currentYear());
						month_switcher.setLabel(date.currentMonth() + 1);
						day_table = dayTable(day_switch, date, day_button_wrapper);
						target.appendChild(day_table.target);
					};
					
					
					var year_switcher = nextPreviousButton(year_switch, create_data, function() {
							date.previousYear();
							resetDateTable(date);
						},
						function() {
							date.nextYear();
							resetDateTable(date);});
						var month_switcher = nextPreviousButton(
							month_switch,
							create_data,
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
							
							target.appendChild(day_table.target);
							
							return {
								target,
								resetDateTable: resetDateTable,
								getDate: function() {
									return date;
								},
								display: function() {
									target.style.display = 'block';
								},
								hide: function() {
									target.style.display = 'target';
								}
							};
						}
					})();
					
					var day_picker = function(selected_day) {
						output.setDate((function(date, input) {
							var generateResult = function() {
								return selected_day.innerHTML + '.' + (date.currentMonth() + 1) +  '.' + date.currentYear();
							};
							var result;
							switch (selected_day.getAttribute('class')) {
								case 'previous':
								date.previousMonth();
								result = '';//generateResult();
								input.resetDateTable(date);
								break;
								case 'next':
								date.nextMonth();
								result = '';//generateResult();
								input.resetDateTable(date);
								break;
								default:
								result = generateResult();
							}
							return result;
						})(input.getDate(), input));
					};
					
					var day_button_wrapper = dayButtonWrapper(day_picker, create_data);
					
					var input = dateInput(date_container, day_button_wrapper, Weekday, Day, Month, Year);
					var output = textOutput(text_edit);
					output.target.addEventListener('click', function() { input.display(); }, true);
					output.target.value = '';
				};
			})();
			