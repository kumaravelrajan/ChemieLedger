# ChemieCluster_DLT4PI

This repository implements a proof on concept solution for a cross-platform blockchain network focused on providing a proof of origin for bio-based products within a recycle supply chain. To show the simple integration in a platform, the [Rohstoffbörse](https://xn--rohstoffbrse-djb.com/home) is used. The original repository can be found [here](https://git.fortiss.org/RB).
The project was conducted in the framework of the TUM university course *Advanced Practical Course - Blockchain technology for public sector innovation (IN2106, IN4212)*.

## Folder Structure:
- `/client`: The Rohstoffbörse frontend component. This folder does not contain any novel code contributions but was only used for testing.
- `/server`: The Rohstoffbörse backend server.
    - `/server/src/fabric`: This subfolder takes care of user enrollment and identity management.
    - `/server/src/routes/fabric.js`: This file provides a exemplary API that shows how to call the chaincode.
- `/database`: A MongoDB database connected to the Rohstoffbörse backend server. It stores users and an encrypted version of the identities.
- `/product-history`: This seperate service consists of a frontend and a backend component and provides the possibility for end users to see a visual representation of the product history.
    - `/product-history/client`: The Angular client service that displays the product history. Scanned QR codes would redirect users to this page.
    - `/product-history/backend`: The express backend server that queries the chaincode to retrieve the product history.

Please refer to the respective folders to get more information.