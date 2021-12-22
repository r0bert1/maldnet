# maldnet

## Getting started

_Please remember to use the command `npm install` in each directory (`frontend`, `backend` and `master`) to install the necessary packages to run the nodes._

After downloading the repository the first step would be to start the master node. This can be done by navigating to the master directory and typing: `npm start`.

The next step is to start the database. This can also be done in the master directory with the command `npm run mongo`. 

_If an error occurs it has most likely to do with the database directory missing. The most likely fix is to create in the master directory an empty folder called "data" and inside that folder another empty folder called "db". Which gives us the following structure inside our master directory: `data/db`_.

Once the master node and the database is running we can start using server nodes.

## Using a server node

A server node includes a frontend and a backend. Start by navigating to the `frontend` directory and running the command `npm run build` to build the project. You can start the node after this using the command `npm start` in the `backend` directory. This will start the node at the default port. The command `npm run start2` also exists to run it on port 3003, but if the user wants to use a specifc port, they can specify it the following way `PORT=4200 npm start`. There exists also in both the frontend and backend directories a `.env` file that can be edited to configure the backend and master address. A `.env.local` can also be created instead to do these configurations.


