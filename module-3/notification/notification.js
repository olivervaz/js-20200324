function cleanObj(selector) {
  Array.from(document.querySelectorAll(selector)).forEach(el => el.remove());
}


export default class NotificationMessage {
  constructor(
    text = "Well done!",
    { duration = 2000, type = "success"} = {},
    cssClass = "notification"
  ) {
    this.text = text;
    this.duration = duration || 6000;
    this.type = type;
    this.cssClass = cssClass;

    cleanObj(`.${this.cssClass}`);
    this.render();
  }

  get template() {
    return `
  <div class="${this.cssClass} ${this.type}" style="--value:${this.convertDuration(this.duration)}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
      ${this.text}
    </div>
    </div>
    </div>`;
  }

  show(parent) {
    let current = this;
    (parent || document.body).append(this.element);
    setTimeout(() => current.remove(), this.duration);
  }

  convertDuration(duration) {
    return this.duration / 1000;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove()
  }
}


