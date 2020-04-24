export default class RangePicker {
  element;
  subElements = {};
  // TODO: rename "selectingFrom"
  selectingFrom = true;
  selected = {
    from: new Date(),
    to: new Date()
  };

  static daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  constructor({
                from = new Date(),
                to = new Date()
              } = {}
  ) {
    this.showDateFrom = new Date(from);
    this.selected = {from, to};

    this.render();
  }

  get template() {
    return `
    <div class="rangepicker">
        <div class="rangepicker__input" data-elem="input">
           ${this.inputTemplate}
        </div>
        <div class="rangepicker__selector" data-elem="selector">
            ${this.selectorTemplate}
        </div>
    </div>`
  }

  get inputTemplate() {
    return `
      <span data-elem="from">${this.selected.from.toLocaleDateString('fi')}</span> -
      <span data-elem="to">${this.selected.to.toLocaleDateString('fi')}</span>
    `
  }

  get selectorTemplate() {
    //new class rangepicker__selector-control has been added
    return `
          <div class="rangepicker__selector-arrow"></div>
          <div class="rangepicker__selector-control rangepicker__selector-control-left"></div>
          <div class="rangepicker__selector-control rangepicker__selector-control-right"></div>
          <div class="rangepicker__calendar">
            <div class="rangepicker__month-indicator">
              <time datetime="${this.selected.from.toLocaleString('default', {month: 'long'})}">
                 ${this.selected.from.toLocaleString('default', {month: 'long'})}
              </time>
            </div>
            ${this.weekDaysTemplate}
            ${this.getMonthDates(this.selected.from.getMonth(), this.selected.from.getFullYear())}
          </div>
          <div class="rangepicker__calendar">
           <div class="rangepicker__month-indicator">
              <time datetime="${this.selected.from.toLocaleString('default', {month: 'long'})}">
                 ${this.selected.to.toLocaleString('default', {month: 'long'})}
              </time>
            </div>
            ${this.weekDaysTemplate}
            ${this.getMonthDates(this.selected.to.getMonth(), this.selected.to.getFullYear())}
          </div>`
  }

  get weekDaysTemplate() {
    const weekDays = ['Пн', 'Вт', 'Cр', 'Чт', 'Пт', 'Сб', 'Вс'];
    return `
        <div class="rangepicker__day-of-week">
            ${weekDays.map(item => `<div>${item}</div>`).join('')}
        </div>
  `
  }

  getMonthDates(month, year) {
    /*
    creates array with dates
    iterateі through array
    returns dates templates
    */
    const daysAmount = [...Array(RangePicker.daysInMonth(month, year)).keys()].map(x => ++x);
    return `
        <div class="rangepicker__date-grid">
            ${daysAmount.map(day => this.getDateTemplate(day, month, year)).join('')}
        </div>
  `
  }

  getDateTemplate(day, mounth, year) {
    const date = new Date(year, mounth, day).toISOString();
    return `
     <button type="button" class="rangepicker__cell" data-value="${date}">${day}</button>
    `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;
    this.element = element;
    console.log(this.element);
    this.subElements = this.getSubElements(element);

    this.initEventListeners();

    this.highlightSelectedDates();

  }

  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-elem]')) {
      subElements[subElement.dataset.elem] = subElement;
    }

    return subElements;
  }

  initEventListeners() {
    const {input, selector} = this.subElements;
    document.addEventListener('pointerdown', this.onOuterClick, true);
    input.addEventListener('pointerdown', this.onInputClick);
    selector.addEventListener("pointerdown", this.onArrowClick);
    selector.addEventListener("pointerdown", this.onDateClick);
  }


  onOuterClick = (event) => {
    const picker = this.element.querySelector('.rangepicker_open');

    if (picker && !event.target.closest('.rangepicker')) {
      picker.classList.remove('rangepicker_open');
    }
  }

  onInputClick = (event) => {
    const input = event.target.closest('[data-elem="input"]');

    if (input) {
      this.element.classList.toggle('rangepicker_open');
    }
  }

  onArrowClick = (event) => {
    const isArrow = event.target.classList.contains('rangepicker__selector-control');
    const arrow = event.target;
    if (isArrow) {

      switch (true) {
        case arrow.classList.contains('rangepicker__selector-control-right'):
          this.selected.from.setMonth(this.selected.from.getMonth() + 1);
          this.selected.to.setMonth(this.selected.from.getMonth() + 1);
          break;
        case arrow.classList.contains('rangepicker__selector-control-left'):
          this.selected.from.setMonth(this.selected.from.getMonth() - 1);
          this.selected.to.setMonth(this.selected.from.getMonth() - 1);
          break;
      }
      this.subElements.selector.innerHTML = this.selectorTemplate;
    }
  }

  onDateClick = (event) => {
    const isDate = event.target.classList.contains('rangepicker__cell');
    const selectedDate = new Date(event.target.dataset.value);

    if (isDate) {
      if (this.selectingFrom) {
        this.clearDatesHighlighting();
        this.selectingFrom = false;
        this.selected.from = selectedDate;
        this.selected.to = selectedDate;
        this.highlightSelectedDates();
        this.subElements.input.innerHTML = this.inputTemplate;
      } else if (!this.selectingFrom && selectedDate > this.selected.from) {
        this.selectingFrom = true;
        this.selected.to = selectedDate;
        this.highlightSelectedDates();
        this.subElements.input.innerHTML = this.inputTemplate;
      } else {
        this.selectingFrom = true;
        this.selected.to = this.selected.from;
      }
    }
  }

  highlightSelectedDates() {
    //adds appropriate classes to cells
    const cells = this.element.querySelectorAll('.rangepicker__cell');
    const fromDate = this.selected.from.getTime();
    const toDate = this.selected.to.getTime();

    cells.forEach(item => {
      const itemDate = new Date(item.dataset.value).getTime();

      if (itemDate > fromDate && toDate && itemDate < toDate) {
        item.classList.add('rangepicker__selected-between')
      } else if (itemDate === fromDate) {
        item.classList.add('rangepicker__selected-from')
      } else if (itemDate === toDate) {
        item.classList.add('rangepicker__selected-from')
      }
    })
  }

  clearDatesHighlighting() {
    const cells = this.element.querySelectorAll('.rangepicker__cell');

    cells.forEach(item => {
      item.classList.remove(
        'rangepicker__selected-between',
        'rangepicker__selected-from',
        'rangepicker__selected-between'
      )
    })
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    const {input, selector} = this.subElements;
    this.remove();
    document.removeEventListener('pointerdown', this.onOuterClick, true);
    input.removeEventListener('pointerdown', this.onInputClick);
    selector.removeEventListener("pointerdown", this.onArrowClick);
    selector.removeEventListener("pointerdown", this.onDateClick);
  }
}
