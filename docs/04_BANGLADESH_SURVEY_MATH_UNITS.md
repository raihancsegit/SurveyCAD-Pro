# 04. Bangladesh Survey Mathematics & Units
**Land Survey CAD & Plot Management Platform**

---

## 1. Land Area Measurement System in Bangladesh (ক্ষেত্রফল পরিমাপ)

In Bangladesh, land area is officially recorded in **শতক / ডেসিমেল (Decimal)**, **কাঠা (Katha)**, **বিঘা (Bigha)**, and **একর (Acre)**.

### Master Conversion Constant Table

$$\mathbf{1\ \text{শতক (Decimal)}} = \mathbf{435.60\ \text{Square Feet}} = \mathbf{1000.00\ \text{Square Links}} = \mathbf{40.4686\ \text{Square Meters}}$$

| Unit Name (English) | Unit Name (বাংলা) | Square Feet (বর্গফুট) | Square Links (বর্গলিংক) | Square Meters (বর্গমিটার) | Shotok (শতক) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Square Foot** | বর্গফুট | 1.000 | 2.29568 | 0.092903 | 0.0022957 |
| **Square Link** | বর্গলিংক | 0.4356 | 1.000 | 0.0404686 | 0.001000 |
| **Square Yard (Gaj)**| বর্গগজ | 9.000 | 20.661 | 0.836127 | 0.020661 |
| **Square Meter** | বর্গমিটার | 10.7639 | 24.7105 | 1.000 | 0.0247105 |
| **ছটাক (Chhatak)** | ছটাক | 45.000 | 103.305 | 4.1806 | 0.1033 |
| **শতক / ডেসিমেল** | শতক / ডেসিমেল | **435.600** | **1000.000** | **40.4686** | **1.000** |
| **কাঠা (Katha)** | কাঠা | **720.000** | **1652.893** | **66.8903** | **1.65289** |
| **বিঘা (Bigha)** | বিঘা (২০ কাঠা) | **14,400.000**| **33,057.851**| **1,337.805**| **33.05785** |
| **একর (Acre)** | একর (১০০ শতক) | **43,560.000**| **100,000.000**| **4,046.856**| **100.000** |
| **হেক্টর (Hectare)**| হেক্টর | **107,639.104**| **247,105.38**| **10,000.000**| **247.10538**|

---

## 2. Linear Distance & Gunter's Chain Measurements (দৈর্ঘ্য পরিমাপ)

The standard cadastral surveying chain in Bangladesh is **Gunter's Chain** (গান্টার চেইন / শিকল):

$$\mathbf{1\ \text{Gunter Chain (শিকল)}} = \mathbf{66\ \text{Feet}} = \mathbf{100\ \text{Links (লিংক)}} = \mathbf{20.1168\ \text{Meters}} = \mathbf{22\ \text{Yards (গজ)}} = \mathbf{44\ \text{Hath (হাত)}}$$

$$\mathbf{1\ \text{Link (লিংক)}} = \mathbf{0.66\ \text{Feet}} = \mathbf{7.92\ \text{Inches (ইঞ্চি)}} = \mathbf{0.201168\ \text{Meters}}$$

$$\mathbf{1\ \text{Hath (হাত)}} = \mathbf{1.5\ \text{Feet}} = \mathbf{18\ \text{Inches}} = \mathbf{2.2727\ \text{Links}}$$

---

## 3. Mouza Map Scale Calibration Mathematics (নকশার স্কেল সূত্র)

Cadastral survey sheets in Bangladesh are drawn with distinct proportional ratios:

| Map Scale Designation | Scale Ratio | 1 Inch on Map Equals | 1 Link on Ground Equals | Ground Area of 1 Sq. Inch Map |
| :--- | :--- | :--- | :--- | :--- |
| **16" = 1 Mile** | $1 : 3,960$ | 330 Feet (500 Links) | 0.002 Inches on Map | 2.500 শতক (0.025 একর) |
| **32" = 1 Mile** | $1 : 1,980$ | 165 Feet (250 Links) | 0.004 Inches on Map | 0.625 শতক |
| **64" = 1 Mile** | $1 : 990$ | 82.5 Feet (125 Links) | 0.008 Inches on Map | 0.15625 শতক |
| **80" = 1 Mile** | $1 : 792$ | 66.0 Feet (100 Links) | 0.010 Inches on Map | 0.100 শতক |
| **4" = 1 Mile** | $1 : 15,840$ | 1320 Feet (2000 Links)| 0.0005 Inches on Map | 40.000 শতক |

### Two-Point Calibration Formula
Given two points selected on the scan $(x_1, y_1)$ and $(x_2, y_2)$ with user-specified ground distance $D_{\text{ground}}$:

$$D_{\text{pixel}} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$

$$\text{Scale Factor } S = \frac{D_{\text{ground}}}{D_{\text{pixel}}}\quad (\text{unit/pixel})$$

---

## 4. Shoelace Polygon Area Calculation (শু-লেস ক্ষেত্রফল অ্যালগরিদম)

For a closed polygon with $N$ vertices $(x_0, y_0), (x_1, y_1), \dots, (x_{n-1}, y_{n-1})$:

$$\text{Area} = \frac{1}{2} \left| \sum_{i=0}^{N-1} (x_i y_{i+1} - x_{i+1} y_i) \right| \quad (\text{where } x_N = x_0, y_N = y_0)$$

Centroid $(\bar{X}, \bar{Y})$:

$$\bar{X} = \frac{1}{6 \cdot \text{Area}} \sum_{i=0}^{N-1} (x_i + x_{i+1})(x_i y_{i+1} - x_{i+1} y_i)$$

$$\bar{Y} = \frac{1}{6 \cdot \text{Area}} \sum_{i=0}^{N-1} (y_i + y_{i+1})(x_i y_{i+1} - x_{i+1} y_i)$$

---
