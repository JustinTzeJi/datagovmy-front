import { get } from "datagovmy-ui/api";
import { Metadata, PubResource } from "datagovmy-ui/components";
import { AnalyticsProvider } from "datagovmy-ui/contexts/analytics";
import { withi18n } from "datagovmy-ui/decorators";
import { useTranslation } from "datagovmy-ui/hooks";
import { Page } from "datagovmy-ui/types";
import BrowsePublicationsDashboard from "misc/publications/browse";
import { Publication } from "datagovmy-ui/components";
import PublicationsLayout from "misc/publications/layout";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { AxiosResponse } from "axios";

const BrowsePublications: Page = ({
  dropdown,
  meta,
  pub,
  publications,
  params,
  query,
  total_pubs,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation(["publications", "common"]);

  return (
    <AnalyticsProvider meta={meta}>
      <Metadata
        title={pub ? pub.title : t("header")}
        description={pub ? pub.description : t("description")}
        keywords={""}
      />
      <PublicationsLayout>
        <BrowsePublicationsDashboard
          dropdown={dropdown}
          pub={pub}
          publications={publications}
          params={params}
          query={query}
          total_pubs={total_pubs}
        />
      </PublicationsLayout>
    </AnalyticsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = withi18n(
  ["publications", "catalogue"],
  async ({ locale, query, params }) => {
    try {
      const pub_id = params.pub_id ? params.pub_id[0] : "";
      const [{ data: dropdown }, { data }, response] = await Promise.all([
        get("/publication-dropdown/", {
          language: locale,
        }),
        get("/publication/", {
          language: locale,
          ...query,
        }),
        fetch(
          `https://api.tinybird.co/v0/pipes/${
            process.env.NEXT_PUBLIC_APP_ENV === "production" ? "prod" : "staging"
          }_opendosm_pub_downloads_pipe.json`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TINYBIRD_TOKEN}`,
            },
          }
        ),
      ]).catch(e => {
        throw new Error("Invalid filter. Message: " + e);
      });

      const { meta, data: total_downloads } = await response.json();

      const pub: AxiosResponse<PubResource> | null = pub_id
        ? await get(`/publication-resource/${pub_id}`, {
            language: locale,
          })
        : null;

      return {
        notFound: false,
        props: {
          meta: {
            id: "publications",
            type: "dashboard",
            category: null,
            agency: "DOSM",
          },
          dropdown: dropdown,
          pub: pub
            ? {
                ...pub.data,
                resources: pub.data.resources.map(resource => ({
                  ...resource,
                  downloads:
                    total_downloads.find(
                      list =>
                        list.publication_id === pub_id && list.resource_id === resource.resource_id
                    )?.total_downloads ?? 0,
                })),
              }
            : null,
          publications:
            data.results
              .map((item: Publication) => ({
                ...item,
                total_downloads: total_downloads
                  .filter(list => list.publication_id === item.publication_id)
                  .reduce((prev, curr) => prev + curr.total_downloads, 0),
              }))
              .sort(
                (a: Publication, b: Publication) =>
                  Date.parse(b.release_date) - Date.parse(a.release_date)
              ) ?? [],
          params: { pub_id },
          query: query ?? {},
          total_pubs: data.count,
        },
      };
    } catch (e: any) {
      console.log(e);
      console.error(e.message);
      return { notFound: true };
    }
  },
  {
    cache_expiry: 600, // 10 min
  }
);

export default BrowsePublications;
