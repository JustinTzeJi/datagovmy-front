import { Container, Dropdown, Hero, Section } from "@components/index";
import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { numFormat, smartNumFormat, toDate } from "@lib/helpers";
import { useTranslation } from "@hooks/useTranslation";
import { useSlice } from "@hooks/useSlice";
import { useData } from "@hooks/useData";
import type { OptionType } from "@components/types";
import { AKSARA_COLOR } from "@lib/constants";
import type { ChartDataset, ChartTypeRegistry } from "chart.js";
import Slider, { SliderRef } from "@components/Chart/Slider";
import { track } from "@lib/mixpanel";
import { routes } from "@lib/routes";
import { useWatch } from "@hooks/useWatch";
import AgencyBadge from "@components/AgencyBadge";

/**
 * GDP Dashboard
 * @overview Status: Live
 */

interface TimeseriesChartData {
  title: string;
  unitY: string;
  label: string;
  data: number[];
  fill: boolean;
  callout: string;
  prefix: string;
  chartName: string;
}

const Timeseries = dynamic(() => import("@components/Chart/Timeseries"), { ssr: false });

interface GDPDashboardProps {
  last_updated: number;
  timeseries: any;
  timeseries_callouts: any;
}

const GDPDashboard: FunctionComponent<GDPDashboardProps> = ({
  last_updated,
  timeseries,
  timeseries_callouts,
}) => {
  const { t, i18n } = useTranslation(["common", "dashboard-gdp"]);
  const INDEX_OPTIONS: Array<OptionType> = [
    "growth_real_yoy",
    "growth_nominal_yoy",
    "growth_real_qoq",
    "growth_nominal_qoq",
    "real",
    "real_sa",
    "nominal",
  ].map((key: string) => ({
    label: t(`dashboard-gdp:keys.${key}`),
    value: key,
  }));
  const SHADE_OPTIONS: Array<OptionType> = [
    { label: t("dashboard-gdp:keys.no_shade"), value: "no_shade" },
    { label: t("dashboard-gdp:keys.recession"), value: "recession" },
  ];

  const { data, setData } = useData({
    index_type: INDEX_OPTIONS[0],
    shade_type: SHADE_OPTIONS[0],
    minmax: [0, timeseries.data[INDEX_OPTIONS[0].value].x.length - 1],
  });
  const LATEST_TIMESTAMP =
    timeseries.data[data.index_type.value].x[timeseries.data[data.index_type.value].x.length - 1];
  const { coordinate } = useSlice(timeseries.data[data.index_type.value], data.minmax);

  const shader = useCallback<(key: string) => ChartDataset<keyof ChartTypeRegistry, any[]>>(
    (key: string) => {
      if (key === "no_shade")
        return {
          data: [],
        };

      return {
        type: "line",
        data: coordinate[key],
        backgroundColor: AKSARA_COLOR.BLACK_H,
        borderWidth: 0,
        fill: true,
        yAxisID: "y2",
        stepped: true,
      };
    },
    [data]
  );

  const configs = useCallback<
    (key: string) => { prefix: string; unit: string; callout: string; fill: boolean }
  >(
    (key: string) => {
      const isRM: boolean = ["real", "real_sa", "nominal"].includes(data.index_type.value);
      const prefix = isRM ? "RM" : "";
      const unit = isRM ? "" : "%";
      const callout = [
        prefix,
        smartNumFormat({
          value: timeseries_callouts.data[data.index_type.value][key].callout,
          type: "compact",
          precision: [1, 1],
          locale: i18n.language,
        }),
        unit,
      ].join("");

      return {
        prefix,
        unit,
        callout,
        fill: data.shade_type.value === "no_shade",
      };
    },
    [data.index_type, data.shade_type, i18n]
  );

  const getChartData = (sectionHeaders: string[]): TimeseriesChartData[] =>
    sectionHeaders.map(chartName => ({
      title: t(`dashboard-gdp:keys.${chartName}`),
      prefix: configs(chartName).prefix,
      unitY: configs(chartName).unit,
      label: t(`dashboard-gdp:keys.${chartName}`),
      data: coordinate[chartName],
      fill: configs(chartName).fill,
      callout: configs(chartName).callout,
      chartName,
    }));

  const section2ChartData = getChartData([
    "supply_services",
    "supply_manufacturing",
    "supply_agri",
    "supply_mining",
    "supply_construction",
    "supply_import_duties",
  ]);

  const section3ChartData = getChartData([
    "demand_c",
    "demand_i",
    "demand_g",
    "demand_x",
    "demand_m",
    "demand_nx",
    "demand_inventory",
  ]);

  useEffect(() => {
    track("page_view", {
      type: "dashboard",
      id: "gdp.header",
      name_en: "Gross Domestic Product (GDP)",
      name_bm: "Keluaran Dalam Negeri Kasar (KDNK)",
      route: routes.GDP,
    });
  }, []);

  useWatch(() => {
    setData("minmax", [0, timeseries.data[data.index_type.value].x.length - 1]);
  }, [data.index_type]);

  return (
    <>
      <Hero
        background="gray"
        category={[t("nav.megamenu.categories.economy"), "text-primary"]}
        header={[t("dashboard-gdp:header")]}
        description={[t("dashboard-gdp:description"), "dark:text-white"]}
        last_updated={last_updated}
        agencyBadge={<AgencyBadge agency="DOSM" link="https://open.dosm.gov.my/" />}
      />

      <Container className="min-h-screen">
        {/* How is GDP trending? */}
        <Section title={t("dashboard-gdp:section_1.title")} date={timeseries.data_as_of}>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row">
              <Dropdown
                anchor="left"
                selected={data.index_type}
                options={INDEX_OPTIONS}
                onChange={e => setData("index_type", e)}
              />
              <Dropdown
                anchor="left"
                options={SHADE_OPTIONS}
                selected={data.shade_type}
                onChange={e => setData("shade_type", e)}
              />
            </div>

            <Slider
              type="range"
              value={data.minmax}
              data={timeseries.data[data.index_type.value].x}
              period="quarter"
              onChange={e => setData("minmax", e)}
            />
            <Timeseries
              title={t("dashboard-gdp:keys.overall")}
              className="h-[350px] w-full"
              interval="quarter"
              displayNumFormat={value =>
                smartNumFormat({
                  value,
                  type: "compact",
                  precision: [1, 1],
                  locale: i18n.language,
                })
              }
              prefixY={configs("overall").prefix}
              unitY={configs("overall").unit}
              lang={i18n.language}
              axisY={{
                y2: {
                  display: false,
                  grid: {
                    drawTicks: false,
                    drawBorder: false,
                    lineWidth: 0.5,
                  },
                  ticks: {
                    display: false,
                  },
                },
              }}
              data={{
                labels: coordinate.x,
                datasets: [
                  {
                    type: "line",
                    data: coordinate.overall,
                    label: t("dashboard-gdp:keys.overall"),
                    borderColor: AKSARA_COLOR.PRIMARY,
                    backgroundColor: AKSARA_COLOR.PRIMARY_H,
                    borderWidth: 1.5,
                    fill: configs("overall").fill,
                  },
                  shader(data.shade_type.value),
                ],
              }}
              stats={[
                {
                  title: t("common.latest", {
                    date: toDate(LATEST_TIMESTAMP, "qQ yyyy", i18n.language),
                  }),
                  value: configs("overall").callout,
                },
              ]}
            />
          </div>
        </Section>
        {/* A deeper look at GDP by economic sector */}
        <Section title={t("dashboard-gdp:section_2.title")} date={timeseries.data_as_of}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {section2ChartData.map(chartData => (
              <Timeseries
                key={chartData.title}
                title={chartData.title}
                className="h-[350px] w-full"
                interval="quarter"
                displayNumFormat={value =>
                  smartNumFormat({
                    value,
                    type: "compact",
                    precision: [1, 1],
                    locale: i18n.language,
                  })
                }
                prefixY={chartData.prefix}
                unitY={chartData.unitY}
                axisY={{
                  y2: {
                    display: false,
                    grid: {
                      drawTicks: false,
                      drawBorder: false,
                      lineWidth: 0.5,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                }}
                data={{
                  labels: coordinate.x,
                  datasets: [
                    {
                      type: "line",
                      label: chartData.label,
                      data: chartData.data,
                      borderColor: AKSARA_COLOR.GREY,
                      backgroundColor: AKSARA_COLOR.GREY_H,
                      fill: chartData.fill,
                      borderWidth: 1.5,
                    },
                    shader(data.shade_type.value),
                  ],
                }}
                stats={[
                  {
                    title: t("common.latest", {
                      date: toDate(LATEST_TIMESTAMP, "qQ yyyy", i18n.language),
                    }),
                    value: chartData.callout,
                  },
                ]}
              />
            ))}
          </div>
        </Section>
        {/* A deeper look at GDP by expenditure category */}
        <Section title={t("dashboard-gdp:section_3.title")} date={timeseries.data_as_of}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {section3ChartData.map(chartData => {
              const chart = (
                <Timeseries
                  key={chartData.title}
                  title={chartData.title}
                  className="h-[350px] w-full"
                  interval="quarter"
                  displayNumFormat={value =>
                    smartNumFormat({
                      value,
                      type: "compact",
                      precision: [1, 1],
                      locale: i18n.language,
                    })
                  }
                  prefixY={chartData.prefix}
                  unitY={chartData.unitY}
                  axisY={{
                    y2: {
                      display: false,
                      grid: {
                        drawTicks: false,
                        drawBorder: false,
                        lineWidth: 0.5,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                  }}
                  data={{
                    labels: coordinate.x,
                    datasets: [
                      {
                        type: "line",
                        label: chartData.label,
                        data: chartData.data,
                        borderColor: AKSARA_COLOR.DANGER,
                        backgroundColor: AKSARA_COLOR.DANGER_H,
                        fill: chartData.fill,
                        borderWidth: 1.5,
                      },
                      shader(data.shade_type.value),
                    ],
                  }}
                  stats={[
                    {
                      title: t("common.latest", {
                        date: toDate(LATEST_TIMESTAMP, "qQ yyyy", i18n.language),
                      }),
                      value: chartData.callout,
                    },
                  ]}
                />
              );

              if (
                [
                  "growth_real_yoy",
                  "growth_real_qoq",
                  "growth_nominal_yoy",
                  "growth_nominal_qoq",
                ].includes(data.index_type.value)
              ) {
                if (!["demand_nx", "demand_inventory"].includes(chartData.chartName)) {
                  return chart;
                }
              } else {
                return chart;
              }
            })}
          </div>
        </Section>
      </Container>
    </>
  );
};

export default GDPDashboard;
