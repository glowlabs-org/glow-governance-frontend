import {
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
import React from 'react'
import {
  ServerDataResponse,
  getServerDataForFarmAndWeights,
} from '@/utils/getFarmServerDataAndWeights'
import { currentGcaUrl } from '@/constants/current-gca-url'
const Temp = ({ data }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <div className="container mx-auto mt-12">{JSON.stringify(data)}</div>
}

export default Temp

export const getStaticProps = (async (ctx: GetStaticPropsContext) => {
  const weeks = await Promise.all([
    // getServerDataForFarmAndWeights(currentGcaUrl, 0, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 1, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 2, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 3, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 4, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 5, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 6, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 7, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 8, false),
    // getServerDataForFarmAndWeights(currentGcaUrl, 9, false),
    getServerDataForFarmAndWeights(currentGcaUrl, 16, false),
  ])

  //ch

  return {
    props: {
      data: weeks,
    },
  }
}) satisfies GetStaticProps<{ data: (ServerDataResponse[] | undefined)[] }>
