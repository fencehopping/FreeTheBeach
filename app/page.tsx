import Image from "next/image";
import { BuyButton } from "@/app/components/BuyButton";
import { formatPrice, products } from "@/lib/products";

export default function Home() {
  const featuredProducts = products.filter((product) => product.featured);
  const assetPath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const withAssetPath = (path: string) => `${assetPath}${path}`;
  const useStaticImages = Boolean(assetPath);

  return (
    <main>
      <section
        className="hero"
        style={{ backgroundImage: `url("${assetPath}/assets/beach-hero.png")` }}
      >
        <div className="announcement-bar">Not anti-bird. Anti-overreach.</div>
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          poster={`${assetPath}/assets/beach-hero.png`}
        >
          <source src={`${assetPath}/videos/birdhero.mp4`} type="video/mp4" />
        </video>
        <div className="hero-scrim" />
        <header className="site-header" aria-label="Primary">
          <a className="brand" href="#top" aria-label="Free The Beach home">
            <Image
              src={withAssetPath("/assets/plover-white.png")}
              alt=""
              width={44}
              height={44}
              priority
              unoptimized={useStaticImages}
            />
            <span>Free The Beach</span>
          </a>
          <nav>
            <a href="#shop">Shop</a>
            <a href="#drop">Drop</a>
            <a href="#access">Access</a>
          </nav>
        </header>
        <div className="hero-content" id="top">
          <p className="kicker">Protect the coast. Respect the birds. Free the beach.</p>
          <h1>Free The Beach</h1>
          <p>
            We&apos;re not anti-bird - we&apos;re anti-overreach. For everyone who thinks humans should
            still be welcome at the beach.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#shop">
              Shop the first drop
            </a>
            <a className="secondary-link" href="#story">
              Read our story
            </a>
          </div>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <p className="kicker">First run</p>
            <h2>The First Drop</h2>
          </div>
          <p className="section-subtext">
            Stickers, hats, and beach gear for people who believe in shared shorelines.
          </p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <Image
                  src={withAssetPath(product.image)}
                  unoptimized={useStaticImages}
                  alt={`${product.name} - Free The Beach`}
                  fill
                  sizes="(max-width: 720px) 100vw, 25vw"
                />
              </div>
              <div className="product-info">
                <p>{product.category}</p>
                <h3>{product.name}</h3>
                <span>{formatPrice(product.price)}</span>
                <p>{product.description}</p>
              </div>
              <BuyButton productId={product.id} />
            </article>
          ))}
        </div>
      </section>

      <section className="story-section" id="story">
        <div>
          <p className="kicker">The Movement</p>
          <h2>Not a protest. Beach people with a point.</h2>
        </div>
        <p>
          We&apos;re not a protest. We&apos;re beach people with a sense of humor and one small point to
          make: protecting wildlife and enjoying the beach were never supposed to be mutually
          exclusive. Common sense, shared shorelines, and a little fun with the absurdity of modern
          beach rules.
        </p>
      </section>

      <section className="drop-section" id="drop">
        <div>
          <p className="kicker">Next tide</p>
          <h2>Join the Beach Liberation List</h2>
          <p>
            New drops, local beach-access nonsense, and the occasional bird update. No spam -
            we&apos;re too busy at the beach.
          </p>
        </div>
        <form className="drop-form">
          <label htmlFor="email">Drop alerts</label>
          <div>
            <input id="email" name="email" type="email" placeholder="you@example.com" />
            <button type="submit">Count me in</button>
          </div>
        </form>
      </section>

      <section className="access-section" id="access">
        <div className="access-copy">
          <p className="kicker">The line</p>
          <h2>Shared shorelines. Common sense.</h2>
          <p>
            Free The Beach is a coastal merch brand and beach-access movement. Beach people, common
            sense, shared shorelines.
          </p>
        </div>
        <div className="featured-stack">
          {featuredProducts.map((product) => (
            <div className="mini-product" key={product.id}>
              <Image
                src={withAssetPath(product.image)}
                alt={`${product.name} - Free The Beach`}
                width={88}
                height={88}
                unoptimized={useStaticImages}
              />
              <div>
                <strong>{product.name}</strong>
                <span>{formatPrice(product.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="site-footer">
        <strong>Protect the coast. Respect the birds. Free the beach.</strong>
        <nav aria-label="Footer">
          <a href="#shop">Shop</a>
          <a href="#story">Our Story</a>
          <a href="#drop">Contact</a>
          <a href="#drop">Shipping & Returns</a>
          <a href="#drop">Privacy Policy</a>
        </nav>
      </footer>
    </main>
  );
}
