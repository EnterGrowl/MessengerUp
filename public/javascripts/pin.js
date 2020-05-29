var enableAutoSubmit = true

document.querySelectorAll('.digipin').forEach(ele => {
  ele.addEventListener('keyup', e => {
    if ([16].indexOf(e.keyCode) >= 0) return
    if ([37,39].indexOf(e.keyCode) < 0) {
      
      if (e.target.value.length === 1) {
        let nextId = +e.target.dataset.id + 1
        if (document.querySelector('#digit-' + nextId)) {
          document.querySelector('#digit-' + nextId).focus()   
        }
      }

      let ok = true
      document.querySelectorAll('.digipin').forEach(ele => {
        if (ele.value === '') {
          ok = false
        }
      })

      if (ok && enableAutoSubmit) {
        verifyPIN()
      }
    }
  })
  ele.addEventListener('focus', e => {
    let currentId = +e.target.dataset.id
    
    let moveTo = null
    for(let i = (currentId - 1); i > 0; i--) {
      if (document.querySelector('#digit-' + i)) {
        if (document.querySelector('#digit-' + i).value === '') {
           moveTo = i
        }
      }
    }
    if (moveTo) {
      document.querySelector('#digit-' + moveTo).focus()  
    }
  })
})

window.addEventListener('keydown', e => {
  if ([16].indexOf(e.keyCode) >= 0) return
  if (e.keyCode === 8) {
    e.preventDefault()
    if (e.target.value !== '') {
      e.target.value = '';
    } else {
      let prevId = +e.target.dataset.id - 1
      if (document.querySelector('#digit-' + prevId)) {
        document.querySelector('#digit-' + prevId).value = ''
        document.querySelector('#digit-' + prevId).focus()
      }
    }
  } else if (e.keyCode === 37 && !e.shiftKey) {
    let id = +e.target.dataset.id - 1
    if (document.querySelector('#digit-' + id)) {
      let val = +document.querySelector('#digit-' + id).value
      document.querySelector('#digit-' + id).focus()
    }
  } else if (e.keyCode === 39 && !e.shiftKey) {
    let id = +e.target.dataset.id + 1
    if (document.querySelector('#digit-' + id)) {
      document.querySelector('#digit-' + id).focus()
    }
  }
})