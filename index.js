$(document).ready(function () {
    /** var */
    const userURL = `http://localhost:3000/users`;
    const userTable = $('#user-table');
    const createForm = $('#user-create-form');
    const editForm = $('#user-edit-form');
    const createFormWrapper = $('#user-create-form-wrapper');
    const editFormWrapper = $('#user-edit-form-wrapper');


    var users = {};


    $('#create-dob,#edit-dob').datepicker({
        format: 'dd/mm/yyyy',
    });

    $('#close-user-edit-form-wrapper').click(function () {
        toggleForms();
        editForm.trigger('reset');
    });


    /** methods */

    function getUsers(handleData) {
        $.ajax({
            url: userURL,
            async: false,
            success: function (data) {
                handleData(data);
            },
            dataType: 'json'
        });
    }

    function read(users, userTable) {

        $.each(users, function (i, item) {
            if (userTable.find('tbody').find(`tr[data-row-id="${item.id}"]`).length < 1) {
                userTable.find('tbody').append(`
                    <tr data-row-id="${item.id}">
                        <td>${item.username}</td>
                        <td>${item.password}</td>
                        <td>${item.name}</td>
                        <td>${item.dob}</td>
                        <td>${item.major}</td>
                        <td>
                            <div class="btn-group" role="group" aria-label="actions">
                                <button type="button" class="btn btn-secondary btn-sm" data-action="user-action-edit-button" data-id="${item.id}">edit</button>
                                <button type="button" class="btn btn-danger btn-sm" data-action="user-action-delete-button" data-id="${item.id}">delete</button>
                            </div>
                        </td>
                        
                    </tr>
                `);
            }
        });
    }

    function toggleForms() {
        createFormWrapper.toggleClass('d-none');
        editFormWrapper.toggleClass('d-none');
    }

    /** ajax */

    // Create section
    createForm.submit(function (e) {
        e.preventDefault();
        let username = createForm.find('#create-username').val();
        let password = createForm.find('#create-password').val();
        let name = createForm.find('#create-name').val();
        let dob = createForm.find('#create-dob').val();
        let major = createForm.find('#create-major').val();

        getUsers(function (o) {
            let user = o.find(function (user) {
                return user.username == username
            });

            if (!user) {

                let temp = {
                    username: username,
                    password: password,
                    name: name,
                    dob: dob,
                    major: major
                };

                $.ajax({
                    url: userURL,
                    method: 'post',
                    data: temp,
                    headers: 'application/json',
                    dataType: 'json',
                    success: function (data) {
                        getUsers(function (o) {
                            read(o, userTable);
                        });
                        createForm.trigger('reset');
                    }
                });

            } else
                alert('Username already exists.');
        });

    });



    // Edit section
    $(document).on('click', 'button[data-action=user-action-edit-button]', function () {
        let id = $(this).attr('data-id');
        getUsers(function (o) {
            let user = o.find(function (user) {
                return user.id == id
            });
            if (user) {
                if (editFormWrapper.hasClass('d-none')) toggleForms();
                editForm.find('#edit-id').val(`${user.id}`);
                editForm.find('#edit-username').val(`${user.username}`);
                editForm.find('#edit-password').val(`${user.password}`);
                editForm.find('#edit-name').val(`${user.name}`);
                editForm.find('#edit-dob').val(`${user.dob}`);
                editForm.find('#edit-major').val(`${user.major}`);
            }
        })
    });
    editForm.submit(function (e) {
        e.preventDefault();
        let id = editForm.find('#edit-id').val();
        let username = editForm.find('#edit-username').val();
        let password = editForm.find('#edit-password').val();
        let name = editForm.find('#edit-name').val();
        let dob = editForm.find('#edit-dob').val();
        let major = editForm.find('#edit-major').val();


        getUsers(function (o) {
            let user_by_username = o.find(function (user) {
                return user.username == username;
            });

            let current_user = o.find(function (user) {
                return user.id == id;
            });

            if (!user_by_username || current_user.id == user_by_username.id) {
                let temp = {
                    username: username,
                    password: password,
                    name: name,
                    dob: dob,
                    major: major
                };

                $.ajax({
                    url: `${userURL}/${id}`,
                    method: 'patch',
                    data: temp,
                    headers: 'application/json',
                    dataType: 'json',
                    success: function (data) {
                        $(document).find(`[data-row-id=${id}]`).remove();
                        getUsers(function (o) {
                            read(o, userTable);
                        });
                        editForm.trigger('reset');
                        toggleForms();
                    }
                });
            } else {
                alert('Username already exists.')
            }
        });
    })


    // Delete section
    $(document).on('click', 'button[data-action=user-action-delete-button]', function () {

        let id = $(this).attr('data-id');
        console.log(id);
        getUsers(function (o) {
            let user = o.find(function (user) {
                return user.id == id
            });

            if (user) {
                $.ajax({
                    url: `${userURL}/${id}`,
                    method: 'delete',
                    headers: 'application/json',
                    dataType: 'json',
                    success: function (data) {
                        $(document).find(`[data-row-id=${id}]`).remove();
                        getUsers(function (o) {
                            read(o, userTable);
                        });
                    }
                });
            } else
                alert('User is not existed.');
        });

    });

    /** methods call */
    getUsers(function (o) {
        read(o, userTable);
    });


});