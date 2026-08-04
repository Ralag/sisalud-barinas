import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="es">
            <Head>
                <meta charSet="utf-8" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <meta name="description" content="SISALUD - Sistema Informático de Salud" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
