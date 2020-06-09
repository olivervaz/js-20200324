export default class DoubleSlider {
  element;
  subElements = {};

  constructor ({
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
    const { from, to } = this.selected;

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
    thumbLeft.addEventListener('mousedown', this.onMouseDown);
    thumbRight.addEventListener('mousedown', this.onMouseDown);
  }

  onMouseDown = (event) => {
    const thumb = event.target;
    const { left, right } = thumb.getBoundingClientRect();

    //prevent highlighting;
    event.preventDefault();

    //get shift value for preventing centering;
    if (thumb.dataset.element === 'thumbLeft') {
      this.shiftX = right - event.clientX;
    } else {
      this.shiftX = left - event.clientX;
    }

    this.moving = thumb;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseUp = (event) => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event) => {
    const {inner, progress} = this.subElements;
    const {left: innerLeft, right:innerRight, width} = inner.getBoundingClientRect();
    const thumb = this.moving;

    let newLeft = event.clientX - this.shiftX - innerLeft;
    let newRight = event.clientX - this.shiftX - innerRight;

    // keep thumb in bar borders;
    if (newLeft < 0) {
      newLeft = 0;
    }
    let rightEdge = inner.offsetWidth - thumb.offsetWidth;

    if (newLeft > rightEdge) {
      newLeft = rightEdge;
    }

    if(thumb.dataset.element === 'thumbLeft'){
      thumb.style.left = newLeft + 'px';
      progress.style.left = thumb.style.left;
    } else {
      thumb.style.right =  - newRight + 'px';
      progress.style.right = thumb.style.right;
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
    this.remove();
    // ...clear event listeners
  }
}
