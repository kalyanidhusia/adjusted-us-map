import geopandas as gpd
import matplotlib.pyplot as plt

# Load adjusted shapefile
shapefile_path = "adjusted_us_states_combined.shp"
gdf = gpd.read_file(shapefile_path)

# Plot
fig, ax = plt.subplots(figsize=(12, 8))
gdf.boundary.plot(ax=ax, color="black", linewidth=0.5)
gdf.plot(ax=ax, color="lightblue", edgecolor="gray")

# Label each state
for idx, row in gdf.iterrows():
    if row.geometry.geom_type in ["Polygon", "MultiPolygon"]:
        centroid = row.geometry.centroid
        ax.text(centroid.x, centroid.y, row['state_abbv'], fontsize=6, ha='center')

ax.set_title("Adjusted U.S. States Map with AK, HI, PR", fontsize=14)
ax.axis("off")
plt.tight_layout()
plt.savefig("adjusted_us_map.png", dpi=300)
plt.show()

