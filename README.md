![ACM-HEADER](https://user-images.githubusercontent.com/14032427/92643737-e6252e00-f2ff-11ea-8a51-1f1b69caba9f.png)

<h1 align="center"> ACM Connect </h1>

<p align="center"> 
Auto-redirect users to Whatsapp groups
</p>

<p>
  <a href="https://acmvit.in/" target="_blank">
    <img alt="made-by-acm" src="https://img.shields.io/badge/MADE%20BY-ACM%20VIT-blue?style=for-the-badge" />
  </a>

  <a href='https://github.com/ACM-VIT/acm-connect-backend/blob/master/LICENSE' target="_blank">
  <img alt="license" src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" />
  </a>
    
</p>

---

Backend API to perform CRUD operations and redirect users to Whatsapp group with built-in cache support.

---

## Features

- Auto redirect the user to whatsapp group from the list of given whatsapp group links.

- Set a custom limit for the whatsapp group members.

- Once the previous whatsapp group is filled, user will be redirected to the next empty group.

- When all the groups are about to fill, a warning mail would be sent to all the administrators.

- Administrator have privileged rights to perform all the CRUD operations.

---

## Usage

To setup project locally, fork the repository.

```console
# Install Packages
npm i

# Build Script
npm run build

# Run the server
npm start
```

---

## Authors

**Authors:** [Swarup Kharul](https://github.com/SwarupKharul), [Anish Mittal](https://github.com/ANISH0309), [Mannan Goyal](https://github.com/Mannan-Goyal), [Srinivas V](https://github.com/cr-trojan23)

**Mentors:** [Yash Kumar Verma](https://github.com/YashKumarVerma), [Shreyas K](https://github.com/HelixW)

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
