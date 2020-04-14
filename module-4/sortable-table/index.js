const STATUS_ENABLED = 1;
const STATUS_DISABLED = 0;


export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];

  constructor(headersConfig, {
    data = []
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.tableTemplate;
    this.element = element.firstElementChild;
    this.element.innerHTML = `${this.getTableHead()} \n ${this.getTableBody()}`;
    this.subElements = this.getSubElements();

  }

  get tableTemplate() {
    return `<div data-elem="productsContainer" class="products-list__container">
                <div class="sortable-table"></div>
            </div>`
  }

  get emptyBodyTemplate() {
    return `
        <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>
    `
  }

  getTableHead() {
    return `
    <div data-elem="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.reduce((prev, next) => prev + this.getHeaderCol(next), '')}
    </div>
    `;
  }

  getTableBody() {
    return `
    <div data-elem="body" class="sortable-table__body">
        ${this.data && this.getBodyRows()|| this.emptyBodyTemplate}
    </div>`

  }

  getHeaderCol(obj) {
    return `
      <div class="sortable-table__cell" data-name="${obj.id}" data-sortable="${obj.sortable}">
        <span>${obj.title}</span>
      </div>`;
  }


  getBodyRows(data = this.data){
    return data.reduce((prev, next) => prev + this.getBodyRow(next), '')
  }

  getBodyRow(obj) {
    return `<a href=${this.getProductUrl(obj)} class="sortable-table__row">
                ${this.headersConfig.map(item => {
                    if (item.template) {
                      return item.template(obj[item.id]);
                    }
                     return `<div class="sortable-table__cell">${obj[item.id]}</div>`;
                    }).join("")
                }
            </a>`
  }

  getSortArrowTemplate(direction) {
    return `<span class="sortable-table__sort-arrow">
              <span class="sortable-table__sort-arrow_${direction}"></span>
            </span>`
  }

  getSubElements(){
    return Array.from(this.element.querySelectorAll('[data-elem]')).reduce((prev, next)=> {
      prev[next.dataset.elem] = next;
      return prev;
    },{})
  }

  getProductUrl(obj) {
    if (obj.subcategory && obj.subcategory.category){
      return  `/${obj.subcategory.id}/${obj.subcategory.category.id}/${obj.id}`
    }
    return `/${obj.id}/`;
  }


  getProductStatus(obj) {
    //this method for further implementations
    switch (obj.status) {
      case STATUS_ENABLED:
        return "Enabled";
      case STATUS_DISABLED:
        return "Disabled";
    }
  }

  getSortedCellSelector(field){
    return `.sortable-table__cell[data-name="${field}"]`
  }


  sortData(field, order) {
    const header = this.headersConfig.find(item => item.id === field);
    const direction = order === "asc" ? 1 : order === "desc"? -1:1;
    return this.data.sort((a, b) => {
      switch (header.sortType) {
        case "number":
          return direction * (a[field] - b[field]);
        case "string":
          return direction * (a[field].localeCompare(b[field], 'default'));
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  sort(field, order){
    const sortedData = this.sortData(field,order);
    const sortedElement = this.element.querySelector(this.getSortedCellSelector(field));
    this.clearSortArrows(sortedElement);
    sortedElement.insertAdjacentHTML('beforeend', this.getSortArrowTemplate(order));
    this.subElements.body.innerHTML = this.getBodyRows(sortedData);
  }

  clearSortArrows(sortedField) {
    const arrow = sortedField.querySelector('.sortable-table__sort-arrow');
    arrow && arrow.remove();
  }

  remove(){
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

