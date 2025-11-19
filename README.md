# 🗺️ Adjusted US Map Visualization Tool

This repository hosts the source code for the **Adjusted US Map Visualization Tool**, a simple, interactive web application that allows users to quickly visualize state-level numerical data on a map of the United States.

Visit the live site to use the tool:
**[https://kalyanidhusia.github.io/adjusted-us-map/](https://kalyanidhusia.github.io/adjusted-us-map/)**

---

### ✨ Features

* **CSV Upload:** Upload a standard Comma Separated Values (CSV) file containing state names/abbreviations and corresponding numerical values.
* **Interactive Visualization:** Renders a choropleth map where state colors are scaled based on your uploaded data. 
* **Dynamic Download:** Allows users to download the generated map image for reports or presentations.

---

### 🚀 How to Use

The tool is designed for simplicity. Follow these steps to generate your map:

1.  **Prepare Your CSV File:**
    Your input file must be a simple CSV with at least two columns:
    * One column containing the **State Name** or **State Abbreviation** (e.g., `California` or `CA`).
    * One column containing the **Numerical Value** you wish to map (e.g., `15.5`, `100`, `2500`).

    > **Example CSV Format:**
    >
    > ```csv
    > State,Value
    > CA,150
    > AR,50
    > NY,200
    > ```

2.  **Visit the Site:**
    Open the application in your browser:
    [https://kalyanidhusia.github.io/adjusted-us-map/](https://kalyanidhusia.github.io/adjusted-us-map/)

3.  **Upload Data:**
    Locate the upload section on the page and select your prepared CSV file. The map should automatically update, coloring the states according to the scale of your provided values.

4.  **View and Interact:**
    Inspect the map. The color gradient indicates the magnitude of the values you provided.

5.  **Download the Map:**
    Use the provided **Download Map** button or functionality to save the visualized map image to your local device.

---

### 💻 Development & Contribution

This repository contains the HTML, CSS, and JavaScript necessary to run the visualization tool.

If you wish to contribute, report issues, or suggest new features, please feel free to open a **Pull Request** or an **Issue**.
