$(document).ready(_=> {
    hideAll();
    if(localStorage.getItem('token')){
      ready()
    }
})

function ready() {
  $(`#todo-pending`).show();
  $(`#todo-active`).show();
  $(`#todo-complete`).show();
  $(`#new-task`).show();
  $(`#register-nav`).hide();
  $(`#login-nav`).hide();
  $(`#logout-nav`).show();
  loadTodos()
}

function hideAll() {
    $(`#login-error`).hide();
    $(`#register-error`).hide();
    $(`#todo-error`).hide();
    $(`#todo-pending`).hide();
    $(`#todo-active`).hide();
    $(`#todo-complete`).hide();
    $(`#todo-add-container`).hide();
    $(`#new-task`).hide();
    $(`#logout-nav`).hide();
    $(`#todo-queue-container`).empty()
    $(`#todo-active-container`).empty()
    $(`#todo-complete-container`).empty()
};

function login() {
    $(`#login-error`).hide()
    let email = $(`#login-email`).val()
    let password = $(`#login-password`).val()
    $.ajax({
        method: 'POST',
        url: 'http://localhost:3000/users/login',
        data: {
          email,
          password
        }
      })
        .done(function (response) {
          $(`#register-nav`).hide();
          $(`#login-nav`).hide();
          $(`#logout-nav`).show();
          $(`#login-container`).modal(`hide`);

          const token = response.token
          localStorage.setItem('token', token)
          clearForms();
          $(`#todo-pending`).show();
          $(`#todo-active`).show();
          $(`#todo-complete`).show();
          $(`#new-task`).show();
          loadTodos()
        })
        .fail(function (err) {
          $(`#login-error`).show()
          $(`#login-error`).empty()
          $(`#login-error`).append(err.responseJSON.Error.message)
        })
}

function register() {
    $(`#register-error`).hide()
    let nickname = $(`#register-nickname`).val()
    let email = $(`#register-email`).val()
    let password = $(`#register-password`).val()

    $.ajax({
        method: 'POST',
        url: 'http://localhost:3000/users/register',
        data: {
          nickname,
          email,
          password
        }
      })
        .done(function (response) {
          $(`#register-container`).modal(`hide`);
          $(`#login-container`).modal(`show`);
          clearForm();
          $(`#login-email`).val(email)
        })
        .fail(function (err) {
          console.log(err)
          $(`#register-error`).show()
          $(`#register-error`).empty()
          $(`#register-error`).append(err.responseJSON.Error)
        })
}

function logout() {
    localStorage.clear()
    hideAll()
    $(`#register-nav`).show();
    $(`#login-nav`).show();
    $(`#logout-nav`).hide();
    clearForms();
  }

function clearForms() {
  $(`#register-nickname`).val(``)
  $(`#register-email`).val(``)
  $(`#register-password`).val(``)
  $(`#login-email`).val(``)
  $(`#login-password`).val(``)
  $(`#todo-title`).val(``)
  $(`#todo-description`).val(``)
  $(`#datepicker`).val(``)

}

function loadTodos() {
  const token = localStorage.getItem('token')
  $.ajax({
    method : `GET`,
    url : `http://localhost:3000/todos`,
    headers : {
      token
    }
  }).done( result => {
    $(`#todo-queue-container`).empty()
    $(`#todo-active-container`).empty()
    $(`#todo-complete-container`).empty()
    seedHtml(result.Todo);
  })
  .fail(function (err) {
    console.log(err)
  })
}

function seedHtml(result){
  for (let i = 0; i < result.length; i++) {
    const { id, title, description, status, due_date} = result[i]
    let card = newCard( id,title, description, due_date, status )
    if( status == `queued`){
       $(`#todo-queue-container`).append(card)
    } else if(status == `active`){
      $(`#todo-active-container`).append(card)
    } else {
      $(`#todo-complete-container`).append(card)
    }
  }
}

function newCard(id, title, description, due, status) {
  let date = new Date(due)
  let fullDate = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
  if(status == `queued`){
  return `
<div class="card">
  <div class="card-body">
  <button title="Delete Entry" type="button" class="close" data-dismiss="modal" aria-label="Close" onClick="deleteTodo(${id})"><span aria-hidden="true">&times;</span></button>
    <h5 class="card-title">${title}</h5>
    <p class="card-text">${description} <br>Due :<br> ${fullDate}</p>
    <a href="#" class="" id="todoid${id}" onClick="alterTodo(${id},'active')">mark active</a>
  </div>
</div>`
  } else if (status == `active`) {
    return `
    <div class="card">
      <div class="card-body">
      <button title="Delete Entry" type="button" class="close" data-dismiss="modal" aria-label="Close" onClick="deleteTodo(${id})"><span aria-hidden="true">&times;</span></button>
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${description} <br>Due :<br> ${fullDate}</p>
        <a href="#" class="" id="todoid${id}" onClick="alterTodo(${id},'queued')">mark inactive</a>
        <a href="#" class="" id="todoid${id}" onClick="alterTodo(${id},'complete')">mark complete</a>
      </div>
    </div>`
  } else {
    return `
    <div class="card">
      <div class="card-body">
      <button title="Delete Entry" type="button" class="close" data-dismiss="modal" aria-label="Close" onClick="deleteTodo(${id})"><span aria-hidden="true">&times;</span></button>
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${description} <br>Status :<br> ${status}</p>
      </div>
    </div>`
  }
}

function createTodo() {
    const token = localStorage.getItem('token')
    $(`#todo-error`).hide()
    let title = $(`#todo-title`).val()
    let description = $(`#todo-description`).val()
    let due_date = $(`#datepicker`).val()

    $.ajax({
        method: 'POST',
        url: 'http://localhost:3000/todos/',
        data: {
          title,
          description,
          due_date
        },
        headers : {
          token
        }
      })
        .done(function (response) {
          loadTodos()
          $(`#todo-add-container`).modal(`hide`)
          clearForms();
        })
        .fail(function (err) {
          console.log(err)
          $(`#todo-error`).show();
          $(`#todo-error`).empty();
          $(`#todo-error`).append(err.responseJSON.Error);
        })
}

function deleteTodo(id) {

  const token = localStorage.getItem('token')
  $(`#todo-error`).hide()
  let title = $(`#todo-title`).val()
  let description = $(`#todo-description`).val()
  let due_date = $(`#datepicker`).val()

  $.ajax({
      method: 'DELETE',
      url: `http://localhost:3000/todos/${id}`,
      headers : {
        token
      }
    })
      .done(function (response) {
        loadTodos()
      })
      .fail(function (err) {
        $(`.toast-container`).append(newToast(err));
        $('.toast').toast('show');
        clearToast(10000)
      })
}

function alterTodo(id, status) {
  let url = ``;
  if(status == `queued`){
    url = `http://localhost:3000/todos/${id}/queued`
  } else if(status == `active`) {
    url = `http://localhost:3000/todos/${id}/active`
  } else {
    url = `http://localhost:3000/todos/${id}/complete`
  }
  const token = localStorage.getItem('token')

  $.ajax({
      method: 'PUT',
      url,
      headers : {
        token
      }
    })
      .done(function (response) {
        loadTodos()
      })
      .fail(function (err) {
        $(`.toast-container`).append(newToast(err.responseJSON.Error));
        $('.toast').toast('show');
        clearToast(10000)
      })
}

function newToast(err){
  return `            
  <!-- Then put toasts within -->
  <div class="toast" role="alert" aria-live="assertive" data-animation="true" aria-atomic="true" data-delay="10000" style="width: 400px">
  <div class="toast-header">
      <strong class="mr-auto">Alert</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
      <span aria-hidden="true">&times;</span>
      </button>
  </div>
  <div class="toast-body">
      ${err}
  </div>
  </div>`
}

function clearToast(milis){
  setTimeout(_=> {
    $(`.toast-container`).empty();
  },milis)
}