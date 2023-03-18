import path from "path";
import {version} from './package.json';

import * as webpack from "webpack";
import "webpack-dev-server"

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import Shell from "shelljs";

interface Environment {
    production: boolean
}

export default function (env: Environment): webpack.Configuration[] {
    return [
        mainConfig(env)
    ]
}

function mainConfig(env: Environment): webpack.Configuration {
    return config(env,
        function base() {
            return {
                mode: env.production ? "production" : "development",
                devtool: env.production ? false : "source-map",
                target: "web",
            }
        },

        function entryAndOutput() {
            return {
                entry: {
                    index: "./src/index.tsx",
                },
                output: {
                    path: absolutePathHelper("./dist"),
                    clean: true,
                }
            }
        },

        function resolveConfig() {
            return {
                resolve: {
                    extensions: [".js", ".ts", ".tsx", ".css", ".scss"],
                    alias: aliasHelper({
                        src: "src",
                        assets: "assets",
                        secrets: "secrets",
                        config: "config",
                    })
                }
            }
        },

        function moduleConfig() {
            return {
                module: {
                    rules: [
                        {
                            test: /\.tsx?$/,
                            use: [
                                "ts-loader"
                            ]
                        },
                        {
                            test: /\.s[ac]ss$/,
                            use: [
                                MiniCssExtractPlugin.loader,
                                "css-loader",
                                "sass-loader"
                            ]
                        },
                        {
                            test: /\.(png|svg|jpg|jpeg|gif)$/i,
                            type: "asset/resource",
                            generator: {
                                filename: "assets/images/[hash][ext]"
                            }
                        },
                        {
                            test: /\.(woff|woff2|eot|ttf|otf)$/i,
                            type: "asset/resource",
                            generator: {
                                filename: "assets/fonts/[hash][ext]"
                            }
                        },
                    ]
                }
            }
        },

        function pluginsConfig() {
            let commit = Shell.exec("git log --pretty=format:%h -n 1")

            return {
                plugins: [
                    new webpack.DefinePlugin({
                        "process.env.HARMONY_VERSION": `"v${version}-${commit}"`
                    }),

                    new MiniCssExtractPlugin(),

                    new HtmlWebpackPlugin({
                        template: "./src/index.html",
                        filename: "index.html",
                        chunks: ["index"]
                    })
                ]
            }
        },

        function devServer() {
            return {
                devServer: {
                    host: "localhost",
                    port: 5000,
                    open: "/auth",
                    compress: true,
                    historyApiFallback: true
                }
            }
        }
    )
}

type ConfigEntry = ((env: Environment) => webpack.Configuration) | webpack.Configuration

function config(env: Environment, ...entries: ConfigEntry[]): webpack.Configuration {
    let result: webpack.Configuration = {};

    for (let entry of entries) {
        Object.assign(result, typeof entry == "function" ? entry(env) : entry)
    }

    return result;
}

function aliasHelper(params: { [name: string]: string }): { [name: string]: string } {
    for (let param in params) {
        params[param] = absolutePathHelper(params[param])
    }

    return params;
}

function absolutePathHelper(relativePath: string): string {
    return path.resolve(__dirname, relativePath)
}