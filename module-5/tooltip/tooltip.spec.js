import tooltip from "./index";

describe("tooltip", () => {
  beforeEach(() => {
    document.body.innerHTML = `
    <div data-tooltip="bar-bar-bar">
      Aperiam consectetur dignissimos dolores ex mollitia.
    </div>
    `;
    tooltip.initialize();
  });

  afterEach(() => {
    tooltip.destroy();
  });

  it("should be rendered correctly", () => {
    tooltip.render('');
    expect(tooltip.element).toBeVisible();
    expect(tooltip.element).toBeInTheDocument();
  });

  it("text should be taken from data atribute", () => {
    expect(tooltip.element.textContent).toEqual("bar-bar-bar")
  })
});




