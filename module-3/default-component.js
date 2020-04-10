class DefaultComponent {
  element; // HTMLElement;

  constructor() {
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {}

  render() {
    this.element = `
      ...some html template here
    `;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // additionally needed to remove all listeners...
  }
}

const defaultComponent = new DefaultComponent();
let element = document.getElementById('root');

element.append(defaultComponent.element);
