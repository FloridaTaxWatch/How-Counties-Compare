// Shared data loader + metric config for the Florida county tax map.
// Slimmed from reference/data.js — keeps the metrics, ranks, and stats
// but drops the PDF-recap + paired-metric plumbing.

const METRICS = {
  // ── Property tax ─────────────────────────────────────────────
  perCapitaTotalPropertyTaxLevies: {
    label: "Per Capita Total Property Tax Levies",
    short: "Total property tax",
    group: "Property tax", format: "currency", year: "2024",
    desc: "Includes all taxing jurisdictions in each county (counties, cities, school districts and special districts) and uses total county population.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCountyPropertyTaxLevies: {
    label: "Per Capita County Government Property Tax Levies",
    short: "County property tax",
    group: "Property tax", format: "currency", year: "2024",
    desc: "Includes county government operating levies, county government debt service levies, dependent special districts and municipal service taxing units (MSTUs).",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaMunicipalPropertyTaxLevies: {
    label: "Per Capita Municipal Government Property Tax Levies",
    short: "Municipal property tax",
    group: "Property tax", format: "currency", year: "2024",
    desc: "Per capita municipal levies were calculated by dividing all municipal levies in a county by total county population. Levies for Jacksonville's consolidated government are included in the county government table; Duval's levies are for Atlantic Beach, Baldwin, Jacksonville Beach, and Neptune Beach.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaSchoolPropertyTaxLevies: {
    label: "Per Capita School District Property Tax Levies",
    short: "School property tax",
    group: "Property tax", format: "currency", year: "2024",
    desc: "Includes both school board operating and debt service levies.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaSpecialDistrictPropertyTaxLevies: {
    label: "Per Capita Independent Special District Property Tax Levies",
    short: "Special district tax",
    group: "Property tax", format: "currency", year: "2024",
    desc: "Includes independent districts only. Dependent districts are included in the county government table. Calculated using total county population.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  avgTotalMillageRate: {
    label: "Average Total Property Tax Millage Rates",
    short: "Avg millage",
    group: "Property tax", format: "millage", year: "2024",
    desc: "Includes all jurisdictions. Calculated using total property tax levies and total taxable value in each county. School district portion calculated using school taxable value, the rest using county taxable value. One mill = $1 per $1,000 of taxable value.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaSaveOurHomesImpact: {
    label: "Per Capita Impact of Save Our Homes in Taxes",
    short: "Save Our Homes",
    group: "Property tax", format: "currency", year: "2024",
    desc: "Represents the amount of property taxes reduced or shifted to other taxpayers by Save Our Homes. Calculated using current average millage rates applied to Save Our Homes differential (just value minus assessed value) of homestead properties.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
  },
  perCapita2008AmendmentImpact: {
    label: "Per Capita Impact of 2008 Property Tax Constitutional Amendment",
    short: "2008 Amendment",
    group: "Property tax", format: "currency", year: "2025",
    desc: "Represents the amount of property taxes reduced or shifted to other taxpayers by Amendment 1 — which raised the Homestead Exemption from $25,000 to $50,000, made Save Our Homes benefits portable, granted a $25,000 tangible personal property exemption, and capped nonhomestead assessment increases at 10%.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
  },
  statewideGrowthChart: {
    label: "Statewide Growth in Property Tax Levies",
    short: "Statewide growth",
    group: "Property tax", format: "currency", year: "FY 2000–01 – FY 2024–25",
    desc: "Twenty-five years of total statewide property tax levies, broken out by jurisdiction.",
    source: "Florida TaxWatch, Florida Department of Revenue, November 2025.",
    special: "statewideGrowth",
  },
  propertyTaxGrowth2014_2024: {
    label: "Property Tax Growth vs. Population & Inflation (2014–2024)",
    short: "Growth vs pop & inflation",
    group: "Property tax", format: "percent", year: "2014–2024",
    desc: "Compares each county's total property tax levy growth against its combined population + inflation growth. Counties are ranked by property-tax growth; the paired population & inflation figure is shown alongside for each county.",
    source: "Florida Department of Revenue and the Office of Economic and Demographic Research. Calculations by Florida TaxWatch, November 2025.",
    paired: "popInflationGrowth2014_2024",
    pairedLabel: "Population & inflation",
    higherIsBetter: false,
  },
  perCapitaExcessTaxGrowth: {
    label: "Per Capita Property Taxes Exceeding Population & Inflation Growth",
    short: "Excess tax growth",
    group: "Property tax", format: "currency", year: "2014–2024",
    desc: "Amount by which per-capita property tax growth outpaced combined population and inflation growth. Includes all taxing jurisdictions.",
    source: "Florida Department of Revenue. Calculations by Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  cityGrowth50: {
    label: "Growth in Property Taxes — 50 Largest Florida Cities (2014–2024)",
    short: "50 cities growth",
    group: "Property tax", format: "percent", year: "2014–2024",
    desc: "City-level 10-year growth for Florida's 50 largest cities. Selecting a county highlights cities located within it.",
    source: "Florida TaxWatch, Office of Economic and Demographic Research, and Florida Department of Financial Services, November 2025.",
    special: "cityGrowth",
    higherIsBetter: false,
  },
  percentTaxableJustValue: {
    label: "Percent of Total Just Value that is Taxable",
    short: "% taxable",
    group: "Property tax", format: "percent", year: "2025",
    desc: "Shows the effect that various exclusions, differentials, exemptions, and credits have on the ad valorem tax base of local governments.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: true,
  },
  perCapitaJustValue: {
    label: "Per Capita Just Value",
    short: "Just value",
    group: "Property tax", format: "currency", year: "2025",
    desc: "Just value is the full market value, the starting point for calculating a property's taxable value.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: true,
  },
  perCapitaTaxableValue: {
    label: "Per Capita Taxable Value",
    short: "Taxable value",
    group: "Property tax", format: "currency", year: "2025",
    desc: "Taxable value is just value of all property in each county, reduced by exclusions, differentials, exemptions, and credits. Uses county taxable value. School taxable value is 10 percent higher statewide.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    higherIsBetter: true,
  },
  totalPropertyTaxLeviesPer1000Income: {
    label: "Total Property Tax Levies Per $1,000 of Personal Income",
    short: "Tax per $1k income",
    group: "Property tax", format: "currency", year: "2023",
    desc: "Includes all taxing jurisdictions. Calculated using 2023 levies and 2023 personal income (latest available county-level income data).",
    source: "Florida TaxWatch, Florida Department of Revenue, and the U.S. Bureau of Economic Analysis, November 2025.",
    higherIsBetter: false,
  },
  percentLeviesChart: {
    label: "Percent of Total Levies 2024",
    short: "% of total levies",
    group: "Property tax", format: "percent", year: "2024",
    desc: "$ In Billions, Percent. County Levies include $4.3 billion in Dependent Special District and Municipal Service Taxing Unit (MSTU) levies.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    special: "percentLevies",
  },
  percentTaxableValueChart: {
    label: "Percent of Taxable Value by Property Type",
    short: "% of taxable value",
    group: "Property tax", format: "percent", year: "2025",
    desc: "Breakdown of statewide taxable value by property type \u2014 homestead and non-homestead residential, agricultural, non-residential, and tangible personal property.",
    source: "Florida Ad Valorem Estimating Conference and Florida TaxWatch, November 2025.",
    special: "percentTaxable",
  },

  // ── Other taxes & fees ───────────────────────────────────────
  localOptionSalesTaxRate: {
    label: "Local Option Sales Tax Rates",
    short: "Sales tax rate",
    group: "Other taxes & fees",
    format: "percent", year: "As of June 1, 2025",
    desc: "County + school discretionary sales surtaxes on top of Florida's 6% state rate. Includes school district levies.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    special: "rateTiers", rateTiersKey: "salesTax",
    higherIsBetter: false,
  },
  perCapitaLocalOptionSalesTaxRevenue: {
    label: "Per Capita Local Option Sales Tax Revenue",
    short: "Sales tax revenue",
    group: "Other taxes & fees",
    format: "currency", year: "FY 2023–24",
    desc: "The majority of local option sales tax revenues are distributed to county governments, but some money goes to municipalities and school boards as well. Collier repealed its tax on December 1, 2023.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Revenue and Florida TaxWatch, November 2025.",
  },
  percentSalesTaxRevenueLevied: {
    label: "Percent of Available Local Option Sales Tax Revenue Being Levied",
    short: "% sales tax levied",
    group: "Other taxes & fees",
    format: "percent", year: "FY 2022–23",
    desc: "Share of the legally-available local option sales tax capacity each county is actually levying.",
    source: "Florida Legislature, Office of Economic and Demographic Research and Florida TaxWatch, November 2025.",
  },
  localOptionMotorFuelTaxRate: {
    label: "Local Option Motor Fuel Tax Rates",
    short: "Fuel tax rate",
    group: "Other taxes & fees",
    format: "currencyCents", year: "As of January 1, 2025",
    desc: "Includes the 9th cent tax (1¢), the local option tax (up to 6¢), and the additional local option tax (up to 5¢). Florida motorists also pay a 31.325¢/gal state tax and an 18.4¢/gal federal tax. Maximum statewide combined rate: 61.7¢/gal.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    special: "rateTiers", rateTiersKey: "motorFuel",
    higherIsBetter: false,
  },
  perCapitaLocalOptionMotorFuelTaxRevenue: {
    label: "Per Capita Local Option Motor Fuel Tax Revenue",
    short: "Fuel tax revenue",
    group: "Other taxes & fees",
    format: "currency", year: "FY 2023–24",
    desc: "Local option motor fuel tax revenues are distributed to county and municipal governments and are generally used for transportation purposes.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Revenue and Florida TaxWatch, November 2025.",
  },
  percentFuelTaxRevenueLevied: {
    label: "Percent of Available Local Option Motor Fuel Tax Revenue Being Levied",
    short: "% fuel tax levied",
    group: "Other taxes & fees",
    format: "percent", year: "As of January 1, 2025",
    desc: "Share of the legally-available local option motor fuel tax capacity each county is actually levying.",
    source: "Florida Legislature, Office of Economic and Demographic Research and Florida TaxWatch, November 2025.",
  },
  localOptionTouristDevelopmentTaxRate: {
    label: "Local Option Tourist Development Tax Rates",
    short: "Tourist tax rate",
    group: "Other taxes & fees",
    format: "percent", year: "As of January 1, 2025",
    desc: "Includes tourist development taxes, tourist impact taxes, professional sport franchise taxes and convention development taxes — nine separate taxes, two of which are available in all 67 counties. Miami-Dade also has a food and beverage tax (2% in hotels, 1% in other establishments) not included above.",
    source: "Florida Department of Revenue and Florida TaxWatch, November 2025.",
    special: "rateTiers", rateTiersKey: "tourist",
  },
  perCapitaLocalOptionTouristDevelopmentTaxRevenue: {
    label: "Per Capita Local Option Tourist Development Tax Revenue",
    short: "Tourist tax revenue",
    group: "Other taxes & fees",
    format: "currency", year: "FY 2023–24",
    desc: "Includes tourist development, tourist impact, professional sport franchise and convention development taxes. Miami-Dade also has a food and beverage tax that produces another $54 million (~$19.38 per capita).",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Revenue and Florida TaxWatch, November 2025.",
  },
  perCapitaLocalCommunicationsServicesTaxRevenue: {
    label: "Per Capita Local Communications Services Tax Revenue",
    short: "Communications tax",
    group: "Other taxes & fees",
    format: "currency", year: "FY 2023–24",
    desc: "Counties and cities may levy the tax on telecommunications and cable services. There are separate rates for each city and unincorporated area; rates range from 0.3% to 7.7%.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Department of Revenue and Florida TaxWatch, November 2025.",
  },
  perCapitaLocalPublicServicesTaxRevenue: {
    label: "Per Capita Local Public Services Tax Revenue",
    short: "Public services tax",
    group: "Other taxes & fees",
    format: "currency", year: "FY 2022–23",
    desc: "Municipalities and charter counties may impose a tax on purchases of electricity, gas, and water service. Most jurisdictions levy the maximum rate of 10%.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Revenue and Florida TaxWatch, November 2025.",
  },
  perCapitaBuildingPermitFees: {
    label: "Per Capita County and Municipal Building Permit Fees",
    short: "Building permit fees",
    group: "Other taxes & fees",
    format: "currency", year: "FY 2022–23",
    desc: "Regulatory fees imposed by cities and counties. Such fees should not exceed the regulated activity's cost and are generally required to be applied solely to that cost. Calhoun has not reported permit fees since 2021 ($14.35 per capita at that time).",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
  },
  perCapitaImpactFees: {
    label: "Per Capita County, Municipal and School Impact Fees",
    short: "Impact fees",
    group: "Other taxes & fees",
    format: "currency", year: "FY 2022–23",
    desc: "Charges imposed by local governments against new development to fund capital facilities made necessary by population growth. Includes school district, city and county fees.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services, Florida Department of Education, and Florida TaxWatch, November 2025.",
  },
  perCapitaSpecialAssessments: {
    label: "Per Capita County, Municipal, and Independent Special District Special Assessment Revenue",
    short: "Special assessments",
    group: "Other taxes & fees",
    format: "currency", year: "FY 2020–21",
    desc: "Special assessments can fund items such as garbage disposal, sewer improvements, fire protection, street improvements, and downtown redevelopment. Reflects total county and municipal assessments divided by total county population.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services, Florida Department of Revenue, and Florida TaxWatch, November 2025.",
  },

  // ── County & Municipal Revenue ───────────────────────────────
  perCapitaTotalRevenue: {
    label: "Per Capita Total County and Municipal Government Revenue",
    short: "Total county & muni revenue",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Includes all reported county and city government revenues and uses total county population to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaMunicipalRevenue: {
    label: "Per Capita Total Municipal Revenue (Total County Population)",
    short: "Muni revenue (county pop)",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Includes all reported city government revenues and uses total county population to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaMunicipalRevenueIncorporated: {
    label: "Per Capita Total Municipal Revenue (Incorporated Population)",
    short: "Muni revenue (incorp. pop)",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Includes all reported city government revenues and uses incorporated population (people living in municipalities) to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCountyRevenue: {
    label: "Per Capita Total County Revenue",
    short: "County revenue",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Includes county government revenue only and uses total county population. Excludes custodial revenue and inter-fund transfers. Duval county data is included in the municipal tables and total county and municipal tables.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCountyMunicipalTaxRevenue: {
    label: "Per Capita County and Municipal Tax Revenue",
    short: "Tax revenue",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Major tax sources include property taxes, public services tax, communications services tax, and local option sales and fuel taxes. Special assessments and impact fees are included in the next table.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCountyMunicipalPermitsFeesAssessments: {
    label: "Per Capita County and Municipal Permits, Fees, and Special Assessment Revenue",
    short: "Permits, fees & assessments",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Includes special assessments, impact fees, building and other permits, franchise fees and license fees.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCountyMunicipalIntergovernmentalRevenue: {
    label: "Per Capita County and Municipal Intergovernmental Revenue",
    short: "Intergov revenue",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Intergovernmental revenue includes all revenues received from federal, state, and other local government sources in the form of grants, shared revenues, and payments in lieu of taxes.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCountyMunicipalStateRevenue: {
    label: "Per Capita Municipal and County Revenue from Florida's State Government",
    short: "State revenue",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Includes state grants, state revenue sharing, and payments in lieu of taxes.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCountyMunicipalChargesForServices: {
    label: "Per Capita County and Municipal Charges for Services",
    short: "Charges for services",
    group: "County & Municipal Revenue",
    format: "currency", year: "FY 2022–23",
    desc: "Charges for services are direct payments by private individuals or other governments for services provided. This includes such services as government owned utilities or waste collection.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  countyRevenueBySource: {
    label: "County Government Revenue by Source",
    short: "County revenue by source",
    group: "County & Municipal Revenue",
    format: "percent", year: "FY 2022–23",
    desc: "Statewide breakdown of all Florida county government revenue by source category. Total: $59.2 billion.",
    source: "Florida Dept. of Financial Services, Office of Economic and Demographic Research, and Florida TaxWatch, November 2025.",
    special: "percentRevenueCounty",
  },
  municipalRevenueBySource: {
    label: "Municipal Government Revenue by Source",
    short: "Muni revenue by source",
    group: "County & Municipal Revenue",
    format: "percent", year: "FY 2022–23",
    desc: "Statewide breakdown of all Florida municipal government revenue by source category. Total: $48.2 billion.",
    source: "Florida Dept. of Financial Services, Office of Economic and Demographic Research, and Florida TaxWatch, November 2025.",
    special: "percentRevenueMunicipal",
  },

  // ── County & Municipal Expenditure ───────────────────────────
  perCapitaTotalExpenditure: {
    label: "Per Capita Total County and Municipal Government Expenditures",
    short: "Total county & muni spending",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Includes all reported county and city government expenditures and uses total county population to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaMunicipalExpenditure: {
    label: "Per Capita Total Municipal Expenditures",
    short: "Municipal spending (county pop)",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Includes all reported city government expenditures and uses total county population to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCountyExpenditure: {
    label: "Per Capita Total County Expenditures",
    short: "County spending",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Includes county government expenditures only and uses total county population. Excludes custodial revenue and inter-fund transfers. Duval county data is included in the municipal tables and total county and municipal tables.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  countyExpenditureGrowth2013_2024: {
    label: "County Expenditure Growth vs. Population and Inflation",
    short: "Expenditure growth vs pop & inflation",
    group: "County & Municipal Expenditure",
    format: "percent", year: "FY 2012–13 to FY 2023–24",
    desc: "Compares each county's total local government expenditure growth against its combined population + inflation growth. Includes all taxing jurisdictions in each county (counties, cities, school districts and special districts).",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    paired: "popInflationGrowth2013_2024",
    pairedLabel: "Population & inflation",
    higherIsBetter: false,
  },
  cityGrowth70Expenditure: {
    label: "Municipal Expenditure Growth vs. Population and Inflation for the 70 Largest Florida Cities",
    short: "70 cities — expenditure growth",
    group: "County & Municipal Expenditure",
    format: "percent", year: "FY 2012–13 to FY 2023–24",
    desc: "City-level 10-year expenditure growth for Florida's 70 largest cities, paired with each city's population + inflation growth over the same period.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
    special: "cityListGrowth",
  },
  perCapitaGeneralGovernmentExpenditure: {
    label: "Per Capita County and Municipal General Government Expenditures",
    short: "General government",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "General government expenditures are those for basic governmental administration, including legislative, executive, financial, legal counsel, information technology (non-court related), and comprehensive planning. Also includes debt service and pension benefits.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaPublicSafetyExpenditure: {
    label: "Per Capita County and Municipal Public Safety Expenditures",
    short: "Public safety",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Public safety expenditures include law enforcement, fire control, protective inspections, emergency and disaster relief, ambulance and rescue services, medical examiners, and consumer affairs.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaPhysicalEnvironmentExpenditure: {
    label: "Per Capita County and Municipal Physical Environment Expenditures",
    short: "Physical environment",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Physical environment expenditures include electric utility, gas and water utility services, garbage/solid waste control, sewer/wastewater services, conservation management, and flood control/storm water management.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaTransportationExpenditure: {
    label: "Per Capita County and Municipal Transportation Expenditures",
    short: "Transportation",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Includes spending on road and street facilities, airports, water transportation systems, and transit and parking facilities. This expenditure category does not include traffic control, law enforcement, and highway safety projects (in public safety).",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaEconomicEnvironmentExpenditure: {
    label: "Per Capita County and Municipal Economic Environment Expenditures",
    short: "Economic environment",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Economic environment includes spending on employment opportunity and development, industry development, veteran's services and housing, and urban development.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaHumanServicesExpenditure: {
    label: "Per Capita County and Municipal Human Services Expenditures",
    short: "Human services",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Human services include hospitals, health, mental health, public assistance, developmental disabilities, and other human services.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCultureRecreationExpenditure: {
    label: "Per Capita County and Municipal Cultural and Recreation Expenditures",
    short: "Cultural & recreation",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Cultural and recreational expenditures include libraries, parks and recreation, cultural services, special events, and special recreational facilities.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  perCapitaCourtRelatedExpenditure: {
    label: "Per Capita County and Municipal Court-Related Expenditures",
    short: "Court-related",
    group: "County & Municipal Expenditure",
    format: "currency", year: "FY 2022–23",
    desc: "Includes general court and circuit court administration, state attorney, public defender and clerks of the court administration, guardian ad litem, hearing officers, dispute resolution, misdemeanor probation, legal aid and other court related expenditures.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025.",
    higherIsBetter: false,
  },
  countyExpenditureBySource: {
    label: "County Government Expenditure by Source",
    short: "County expenditure by source",
    group: "County & Municipal Expenditure",
    format: "percent", year: "FY 2022–23",
    desc: "Statewide breakdown of county government expenditures by category. Total $50.5 billion.",
    source: "Florida Dept. of Financial Services, Office of Economic and Demographic Research, and Florida TaxWatch, November 2025.",
    special: "percentExpenditureCounty",
  },
  municipalExpenditureBySource: {
    label: "Municipal Government Expenditure by Source",
    short: "Municipal expenditure by source",
    group: "County & Municipal Expenditure",
    format: "percent", year: "FY 2022–23",
    desc: "Statewide breakdown of municipal government expenditures by category. Total $40.3 billion.",
    source: "Florida Dept. of Financial Services, Office of Economic and Demographic Research, and Florida TaxWatch, November 2025.",
    special: "percentExpenditureMunicipal",
  },

  // ── Population & Miscellaneous ───────────────────────────────
  population: {
    label: "Total County Population",
    short: "Total county population",
    group: "Population & Miscellaneous",
    format: "integer", year: "April 1, 2025",
    desc: "Population for each of Florida's 67 counties as of April 1, 2025.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Population Estimates by County and Municipality — April 1, 2025; and University of Florida, Bureau of Economic and Business Research (2025 Estimates).",
    higherIsBetter: true,
  },
  percentUnincorporated: {
    label: "Percentage of Population Living in Unincorporated Areas",
    short: "% in unincorporated areas",
    group: "Population & Miscellaneous",
    format: "percent", year: "April 1, 2025",
    desc: "Share of each county's residents who live outside of any incorporated municipality.",
    source: "Florida Estimates of Population: April 1, 2025. Bureau of Economic and Business Research, University of Florida (2025).",
  },
  largestCities70: {
    label: "Population of Florida's 70 Largest Cities",
    short: "70 largest cities",
    group: "Population & Miscellaneous",
    format: "integer", year: "April 1, 2025",
    desc: "Florida's 70 most populous incorporated cities, ranked by April 1, 2025 population.",
    source: "Florida Legislature, Office of Economic and Demographic Research, Florida Population Estimates by County and Municipality — April 1, 2025.",
    special: "cityList",
  },
  populationDensity: {
    label: "Population Density by County",
    short: "Population density",
    group: "Population & Miscellaneous",
    format: "integer", year: "2025 (persons / sq. mi.)",
    desc: "Persons per square mile.",
    source: "World Population Review, Population by Florida County (2025). Accessed September 27, 2025.",
  },
  perCapitaPersonalIncome: {
    label: "Per Capita County Personal Income",
    short: "Personal income",
    group: "Population & Miscellaneous",
    format: "currency", year: "2023",
    desc: "Per capita personal income — total personal income divided by total population.",
    source: "U.S. Department of Commerce, Bureau of Economic Analysis, Current Release: Personal Income by County and Metropolitan Area, 2023, November 14, 2024.",
    higherIsBetter: true,
  },
  unemploymentRate: {
    label: "Unemployment Rate by County",
    short: "Unemployment rate",
    group: "Population & Miscellaneous",
    format: "percent", year: "August 2025",
    desc: "Not seasonally adjusted.",
    source: "Florida Department of Commerce, Local Area Unemployment Statistics by County, September 19, 2025.",
    higherIsBetter: false,
  },
};

function fmt(val, format) {
  if (val == null || Number.isNaN(val)) return "—";
  switch (format) {
    case "currency":
      return val >= 10000
        ? "$" + Math.round(val).toLocaleString()
        : "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "currencyCents":
      return "$" + val.toFixed(3) + "/gal";
    case "millage":
      return val.toFixed(2) + " mills";
    case "percent":
      return val.toFixed(1) + "%";
    case "integer":
      return Math.round(val).toLocaleString();
    default:
      return String(val);
  }
}

function fmtCompact(val, format) {
  if (val == null || Number.isNaN(val)) return "—";
  if (format === "currency") {
    if (val >= 1000) return "$" + (val / 1000).toFixed(1) + "k";
    return "$" + Math.round(val);
  }
  if (format === "integer") {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
    if (val >= 1000) return (val / 1000).toFixed(0) + "k";
    return Math.round(val).toLocaleString();
  }
  return fmt(val, format);
}

// Load counties.json + the plotly all-US-counties geojson filtered to FL (fips 12*).
async function loadFlorida() {
  const [counties, allUSGeo] = await Promise.all([
    fetch("./data/counties.json").then((r) => r.json()),
    fetch("https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json").then((r) => r.json()),
  ]);

  const flFeatures = allUSGeo.features.filter((f) => String(f.properties.STATE) === "12" || String(f.id).startsWith("12"));
  const geo = { type: "FeatureCollection", features: flFeatures };

  const byFips = new Map(counties.map((c) => [c.fips, c]));
  const byName = new Map(counties.map((c) => [c.name.toLowerCase(), c]));

  // Attach geo feature to each county for convenience.
  flFeatures.forEach((f) => {
    const c = byFips.get(f.id);
    if (c) c.feature = f;
  });

  // Compute ranks + stats per metric.
  const stats = {};
  for (const key of Object.keys(METRICS)) {
    const vals = counties.map((c) => c[key]).filter((v) => v != null);
    if (!vals.length) continue;
    const sorted = [...vals].sort((a, b) => a - b);
    const sum = vals.reduce((a, b) => a + b, 0);
    stats[key] = {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      mean: sum / vals.length,
      count: vals.length,
    };
    // Rank — highest value = rank 1. Tie-aware.
    const desc = [...counties]
      .filter((c) => c[key] != null)
      .sort((a, b) => b[key] - a[key]);
    desc.forEach((c, i) => {
      c.ranks = c.ranks || {};
      c.ranks[key] = i + 1;
    });
  }

  return { counties, byFips, byName, geo, stats, METRICS };
}

window.FloridaData = { loadFlorida, METRICS, fmt, fmtCompact };

// ── Statewide reference datasets (not per-county) ───────────────────────
// Used by the `special` metrics (statewideGrowth, percentLevies, percentTaxable).

// FY 2000–01 → FY 2024–25, $ in millions.
window.FloridaStatewideGrowth = [
  { fy: "2000-01", total: 15298, counties: 5823.2, schools: 6506.2, municipalities: 1868.7, special: 1099.4 },
  { fy: "2001-02", total: 16745, counties: 6379.4, schools: 7039.3, municipalities: 2051.8, special: 1274.0 },
  { fy: "2002-03", total: 18192, counties: 6928.8, schools: 7673.7, municipalities: 2184.8, special: 1404.5 },
  { fy: "2003-04", total: 20241, counties: 7644.1, schools: 8427.3, municipalities: 2501.3, special: 1667.8 },
  { fy: "2004-05", total: 22374, counties: 8581.7, schools: 9075.9, municipalities: 2858.9, special: 1857.9 },
  { fy: "2005-06", total: 25688, counties: 9810.6, schools: 10367.2, municipalities: 3373.4, special: 2137.2 },
  { fy: "2006-07", total: 30421, counties: 11468.7, schools: 12294.6, municipalities: 4058.4, special: 2598.8 },
  { fy: "2007-08", total: 31040, counties: 11168.0, schools: 13231.7, municipalities: 4037.2, special: 2602.6 },
  { fy: "2008-09", total: 30207, counties: 10717.5, schools: 13070.2, municipalities: 3917.6, special: 2502.0 },
  { fy: "2009-10", total: 27819, counties: 9811.3, schools: 12069.4, municipalities: 3662.9, special: 2275.2 },
  { fy: "2010-11", total: 25537, counties: 9092.3, schools: 11049.7, municipalities: 3369.8, special: 2025.0 },
  { fy: "2011-12", total: 24251, counties: 8640.6, schools: 10570.6, municipalities: 3265.8, special: 1773.9 },
  { fy: "2012-13", total: 23970, counties: 8561.7, schools: 10348.9, municipalities: 3309.4, special: 1750.1 },
  { fy: "2013-14", total: 24823, counties: 9010.3, schools: 10605.1, municipalities: 3435.1, special: 1772.3 },
  { fy: "2014-15", total: 26360, counties: 9615.1, schools: 11229.1, municipalities: 3693.5, special: 1822.6 },
  { fy: "2015-16", total: 28153, counties: 10306.4, schools: 11939.7, municipalities: 4016.9, special: 1889.9 },
  { fy: "2016-17", total: 29604, counties: 11022.5, schools: 12263.3, municipalities: 4345.0, special: 1973.2 },
  { fy: "2017-18", total: 31251, counties: 11874.3, schools: 12568.6, municipalities: 4749.3, special: 2058.4 },
  { fy: "2018-19", total: 33103, counties: 12753.3, schools: 13051.6, municipalities: 5162.8, special: 2135.6 },
  { fy: "2019-20", total: 35557, counties: 13711.2, schools: 14062.8, municipalities: 5533.9, special: 2248.9 },
  { fy: "2020-21", total: 37494, counties: 14570.0, schools: 14655.5, municipalities: 5891.1, special: 2377.7 },
  { fy: "2021-22", total: 39474, counties: 15492.1, schools: 15237.5, municipalities: 6220.3, special: 2524.3 },
  { fy: "2022-23", total: 44316, counties: 17405.3, schools: 17050.3, municipalities: 7025.0, special: 2835.7 },
  { fy: "2023-24", total: 50457, counties: 19515.4, schools: 19764.0, municipalities: 7915.9, special: 3261.9 },
  { fy: "2024-25", total: 55053, counties: 21577.6, schools: 21447.5, municipalities: 8518.2, special: 3509.2 },
];

// FY 2022–23. $ in billions. Matches fig2dec.pdf.
window.FloridaPercentLevies = [
  { name: "Counties", pct: 39.28 },
  { name: "School Districts", pct: 38.94 },
  { name: "Cities", pct: 15.71 },
  { name: "Ind. Special Districts", pct: 6.07 },
];

// FY 2022–23. Taxable value in $ millions. Matches fig3dec.pdf.
window.FloridaPercentTaxable = [
  { name: "Homestead Residential", pct: 34.96 },
  { name: "Non-Homestead Residential", pct: 34.86 },
  { name: "Non-Residential", pct: 24.28 },
  { name: "Tangible Personal Property", pct: 5.40 },
  { name: "Agricultural", pct: 0.50 },
];

// FY 2022–23. County government revenue by source, $ in millions. Total $59,179.83M.
window.FloridaCountyRevenueBySource = [
  { name: "Charges for Services",            pct: 30.00, value: 17756.11 },
  { name: "Property Taxes",                  pct: 27.26, value: 16129.70 },
  { name: "Intergov. Revenue",               pct: 13.56, value:  8022.47 },
  { name: "Other Sources",                   pct: 12.99, value:  7686.98 },
  { name: "Other Taxes",                     pct: 10.19, value:  6033.04 },
  { name: "Permits, Fees & Special Assess.", pct:  6.00, value:  3551.53 },
];

// FY 2022–23. Municipal government revenue by source, $ in millions. Total $48,236.03M.
window.FloridaMunicipalRevenueBySource = [
  { name: "Charges for Services",            pct: 33.90, value: 16354.20 },
  { name: "Other Sources",                   pct: 25.44, value: 12271.70 },
  { name: "Property Taxes",                  pct: 16.50, value:  7960.63 },
  { name: "Intergov. Revenue",               pct: 10.16, value:  4902.03 },
  { name: "Permits, Fees & Special Assess.", pct:  7.07, value:  3408.09 },
  { name: "Other Taxes",                     pct:  6.92, value:  3339.37 },
];

// FY 2022–23. County government expenditure by source, $ in millions. Total $50,527.26M.
window.FloridaCountyExpenditureBySource = [
  { name: "Public Safety & Courts", pct: 29.76, value: 15038.93 },
  { name: "General Government",     pct: 22.48, value: 11359.14 },
  { name: "Physical Environment",   pct: 13.06, value:  6601.28 },
  { name: "Transportation",         pct: 12.63, value:  6383.85 },
  { name: "Human Services",         pct: 10.46, value:  5286.54 },
  { name: "Economic Environment",   pct:  4.77, value:  2408.29 },
  { name: "Culture/Recreation",     pct:  4.33, value:  2188.08 },
  { name: "Other",                  pct:  2.50, value:  1261.15 },
];

// FY 2022–23. Municipal government expenditure by source, $ in millions. Total $40,315.16M.
window.FloridaMunicipalExpenditureBySource = [
  { name: "Physical Environment",   pct: 27.79, value: 11201.73 },
  { name: "General Government",     pct: 27.28, value: 10997.95 },
  { name: "Public Safety & Courts", pct: 23.84, value:  9611.96 },
  { name: "Culture/Recreation",     pct:  7.17, value:  2890.17 },
  { name: "Transportation",         pct:  6.70, value:  2699.23 },
  { name: "Other",                  pct:  3.34, value:  1345.33 },
  { name: "Economic Environment",   pct:  2.84, value:  1146.89 },
  { name: "Human Services",         pct:  1.05, value:   421.90 },
];

// ── Rate-tier breakdowns ────────────────────────────────────────
// Rate-based tax metrics (sales, fuel, tourist) are presented as a
// tiered bar chart rather than a map, because the underlying rate is
// held at only a handful of discrete values across the state. Each tier
// lists the rate + the counties that levy at that rate.

window.FloridaRateTiers = {
  salesTax: {
    subtitle: "Local option sales tax rates — as of June 1, 2025",
    valueLabel: (v) => v === 0 ? "No Tax" : v.toFixed(1) + "%",
    tiers: [
      { value: 2.0, label: "2.0%", counties: ["Hamilton"] },
      { value: 1.5, label: "1.5%", counties: ["Alachua","Calhoun","Clay","Columbia","DeSoto","Duval","Escambia","Franklin","Gadsden","Hendry","Highlands","Hillsborough","Holmes","Jackson","Leon","Liberty","Madison","Marion","Monroe","Osceola","Wakulla","Washington"] },
      { value: 1.0, label: "1.0%", counties: ["Baker","Bay","Bradford","Brevard","Broward","Charlotte","Dixie","Flagler","Gilchrist","Glades","Gulf","Hardee","Indian River","Jefferson","Lafayette","Lake","Levy","Manatee","Martin","Miami-Dade","Nassau","Okaloosa","Okeechobee","Palm Beach","Pasco","Pinellas","Polk","Putnam","Saint Lucie","Santa Rosa","Sarasota","Seminole","Sumter","Suwannee","Taylor","Union","Walton"] },
      { value: 0.5, label: "0.5%", counties: ["Hernando","Lee","Orange","Saint Johns","Volusia"] },
      { value: 0,   label: "No Tax", counties: ["Citrus","Collier"] },
    ],
  },
  motorFuel: {
    subtitle: "Local option motor fuel tax rates — as of January 1, 2025",
    valueLabel: (v) => v === 0 ? "No Tax" : "$" + v.toFixed(2) + "/gal",
    tiers: [
      { value: 0.12, label: "$0.12/gal", counties: ["Alachua","Bradford","Broward","Charlotte","Citrus","Clay","Collier","DeSoto","Duval","Hardee","Hernando","Highlands","Jackson","Jefferson","Lee","Leon","Madison","Manatee","Marion","Martin","Monroe","Nassau","Okeechobee","Osceola","Palm Beach","Pasco","Polk","Putnam","Santa Rosa","Sarasota","Saint Lucie","Suwannee","Volusia"] },
      { value: 0.11, label: "$0.11/gal", counties: ["Escambia","Levy"] },
      { value: 0.10, label: "$0.10/gal", counties: ["Miami-Dade","Okaloosa"] },
      { value: 0.09, label: "$0.09/gal", counties: ["Hendry"] },
      { value: 0.07, label: "$0.07/gal", counties: ["Baker","Bay","Columbia","Flagler","Gilchrist","Glades","Gulf","Hillsborough","Holmes","Lake","Liberty","Pinellas","Seminole","Sumter","Union","Wakulla","Walton","Washington"] },
      { value: 0.06, label: "$0.06/gal", counties: ["Brevard","Calhoun","Dixie","Franklin","Gadsden","Hamilton","Indian River","Lafayette","Orange","Saint Johns","Taylor"] },
    ],
  },
  tourist: {
    subtitle: "Local option tourist development tax rates — as of January 1, 2025",
    valueLabel: (v) => v === 0 ? "No Tax" : v.toFixed(1) + "%",
    tiers: [
      { value: 6.0, label: "6.0%", counties: ["Broward","Duval","Hillsborough","Manatee","Miami-Dade","Okaloosa","Orange","Osceola","Palm Beach","Pinellas","Sarasota","Volusia"] },
      { value: 5.0, label: "5.0%", counties: ["Alachua","Bay","Brevard","Charlotte","Citrus","Clay","Collier","Columbia","Escambia","Flagler","Gulf","Hernando","Highlands","Indian River","Jackson","Lee","Leon","Madison","Martin","Monroe","Nassau","Pasco","Polk","Santa Rosa","Seminole","Saint Johns","Saint Lucie","Taylor","Walton"] },
      { value: 4.0, label: "4.0%", counties: ["Bradford","Lake","Levy","Marion","Putnam","Wakulla"] },
      { value: 3.0, label: "3.0%", counties: ["Baker","DeSoto","Dixie","Franklin","Gilchrist","Hamilton","Hendry","Holmes","Jefferson","Okeechobee","Suwannee","Washington"] },
      { value: 2.0, label: "2.0%", counties: ["Gadsden","Glades","Hardee"] },
      { value: 0,   label: "No Tax", counties: ["Calhoun","Lafayette","Liberty","Sumter","Union"] },
    ],
  },
};
