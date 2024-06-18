document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    const usersTableBody = document.querySelector('#users-table tbody');

    function fetchUsers() {
        fetch('/users')
            .then(response => {
                console.log('Fetch response:', response);
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);
                usersTableBody.innerHTML = '';
                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td class="actions">
                            <button class="edit" data-id="${user.id}">Edit</button>
                            <button class="delete" data-id="${user.id}">Delete</button>
                        </td>
                    `;
                    usersTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching users:', error));
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const id = document.getElementById('user-id').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        const url = id ? `/users/${id}` : '/users';
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        })
        .then(response => {
            console.log('Form submit response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Form submit data:', data);
            fetchUsers();
            userForm.reset();
        })
        .catch(error => console.error('Error saving user:', error));
    }

    function handleTableClick(event) {
        const target = event.target;
        if (target.classList.contains('edit')) {
            const row = target.closest('tr');
            document.getElementById('user-id').value = row.children[0].textContent;
            document.getElementById('name').value = row.children[1].textContent;
            document.getElementById('email').value = row.children[2].textContent;
        } else if (target.classList.contains('delete')) {
            const id = target.dataset.id;
            fetch(`/users/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                console.log('Delete response:', response);
                return response.json();
            })
            .then(data => {
                console.log('Delete data:', data);
                fetchUsers();
            })
            .catch(error => console.error('Error deleting user:', error));
        }
    }

    userForm.addEventListener('submit', handleFormSubmit);
    usersTableBody.addEventListener('click', handleTableClick);

    fetchUsers();
});
