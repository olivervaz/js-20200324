export default class DoubleSlider {
  element;
  subElements = {};

  constructor({
                min = 100,
                max = 200,
                formatValue = value => '$' + value,
                selected = {
                  from: min,
                  to: max
                }
              } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
  }

  get template() {
    const {from, to} = this.selected;

    return `<div class="range-slider">
      <span data-element="from">${this.formatValue(from)}</span>
      <div data-element="inner" class="range-slider__inner">
        <span data-element="progress" class="range-slider__progress"></span>
        <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
        <span data-element="thumbRight" class="range-slider__thumb-right"></span>
      </div>
      <span data-element="to">${this.formatValue(to)}</span>
    </div>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();
  }

  initEventListeners() {
    const {thumbLeft, thumbRight} = this.subElements;
    thumbLeft.addEventListener('pointerdown', this.onMouseDown);
    thumbRight.addEventListener('pointerdown', this.onMouseDown);
  }

  onMouseDown = (event) => {
    const thumb = event.target;
    const {left, right} = thumb.getBoundingClientRect();

    //prevent highlighting;
    event.preventDefault();

    //get shift value for preventing centering;
    if (thumb.dataset.element === 'thumbLeft') {
      this.shiftX = right - event.clientX;
    } else {
      this.shiftX = left - event.clientX;
    }

    this.moving = thumb;

    document.addEventListener('pointermove', this.onMouseMove);
    document.addEventListener('pointerup', this.onMouseUp);
  }

  onMouseUp = (event) => {
    document.removeEventListener('pointermove', this.onMouseMove);
    document.removeEventListener('pointerup', this.onMouseUp);
  }

  onMouseMove = (event) => {
    const {inner, progress, thumbLeft, thumbRight, from, to} = this.subElements;
    const thumb = this.moving;

    const newLeft = this.calculatePositionPersantage(event.clientX, 'left');
    const newRight = this.calculatePositionPersantage(event.clientX, 'right');
    const boundaryRight = parseFloat(thumbRight.style.right) || 0;
    const boundaryLeft = parseFloat(thumbLeft.style.left) || 0;


    if (thumb.dataset.element === 'thumbLeft' && !this.isBoundary(newLeft, boundaryRight)) {
      this.calculatePrice(newLeft, newRight);
      from.innerHTML = this.formatValue(this.selected.from);
      thumb.style.left = newLeft + '%';
      progress.style.left = thumb.style.left;

    } else if (thumb.dataset.element === 'thumbRight' && !this.isBoundary(newRight, boundaryLeft)) {
      this.calculatePrice(newLeft, newRight);
      to.innerHTML = this.formatValue(this.selected.to);
      thumb.style.right = newRight + '%';
      progress.style.right = thumb.style.right;
    }
  }

  isBoundary(value, boundaryValue) {
    return value + boundaryValue > 100 || value < 0;
  }

  calculatePrice(left, right) {
    const range = this.max - this.min;

    this.selected.from = Math.floor(range / 100 * (100 + left));
    this.selected.to = Math.floor(range / 100 * (100 - right) + this.min);
  }

  calculatePositionPersantage(clientX, direction){
    const {inner} = this.subElements;
    const {left: innerLeft, right: innerRight, width} = inner.getBoundingClientRect();

    switch (direction) {
      case 'left':
        return (clientX - this.shiftX - innerLeft) / width * 100;
      case 'right':
        return (innerRight - clientX - this.shiftX) / width * 100;
      default:
        return;
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    const {thumbLeft, thumbRight} = this.subElements;
    thumbLeft.removeEventListener('pointerdown', this.onMouseDown);
    thumbRight.removeEventListener('pointerdown', this.onMouseDown);
    this.remove();
  }
}
