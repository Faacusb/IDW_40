document.addEventListener("DOMContentLoaded", () => {
    // Initialize
    var selectList = [].slice.call(document.querySelectorAll('.form-select'))
    var selectFields = selectList.map(function (select) {
        return new materialstyle.SelectField(select)
    })

    // Initialize Text fields
    var textFieldList = [].slice.call(document.querySelectorAll('.form-control'))
    var textFields = textFieldList.map(function (textField) {
    return new materialstyle.TextField(textField)
    })

    const rippleSurface = Array.prototype.slice.call(document.querySelectorAll('.ripple-surface'))
    rippleSurface.map(s => {
        return new mdc.ripple.MDCRipple(s)
    })
});


function toggleValidityClasses(input, formFloating) {
  if (input.checkValidity()) {
    formFloating.classList.add("is-valid");
    formFloating.classList.remove("is-invalid");
  } else {
    formFloating.classList.add("is-invalid");
    formFloating.classList.remove("is-valid");
  }
}